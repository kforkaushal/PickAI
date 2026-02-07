document.addEventListener('DOMContentLoaded', () => {
    fetchCryptoPrices(); // Finnhub Live Feed
    fetchCryptoNews(); // Alpha Vantage News

    // Auto-refresh prices every 5 minutes (300,000ms) to reduce API hits
    setInterval(fetchCryptoPrices, 300000);
});

async function fetchCryptoPrices() {
    const CACHE_KEY = 'crypto_prices_cache';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // 1. Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Serving prices from cache');
            updatePriceUI(data.inrRate, data.priceUsdOunce, data.binanceData);
            return;
        }
    }

    // 1. Binance 24hr Ticker (BTC, ETH, SOL, ADA)
    const binanceSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'];
    const binanceUrl = `https://api4.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(binanceSymbols)}`;

    // 2. NBP Official Gold Fixing (PLN per gram, will convert to USD approx or show as Fixing)
    const nbpGoldUrl = 'https://api.nbp.pl/api/cenyzlota/last/1/?format=json';

    // 3. Authenticated Exchange Rate (USD/INR)
    const apiKey = 'effff990e7bcd506495b1b0d';
    const exchangeUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

    try {
        const [binanceRes, nbpRes, exchangeRes] = await Promise.all([
            fetch(binanceUrl).then(res => res.json()),
            fetch(nbpGoldUrl).then(res => res.json()),
            fetch(exchangeUrl).then(res => res.json())
        ]);

        // ExchangeRate-API v6 uses 'conversion_rates'
        const inrRate = exchangeRes.conversion_rates.INR;
        const plnToUsd = 1 / exchangeRes.conversion_rates.PLN;

        // Process Gold (NBP)
        let priceUsdOunce = null;
        if (nbpRes && nbpRes[0]) {
            const pricePlnGram = nbpRes[0].cena;
            priceUsdOunce = (pricePlnGram * 31.1035) * plnToUsd;
        }

        // Cache the raw data we need
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: {
                inrRate,
                priceUsdOunce,
                binanceData: binanceRes
            }
        }));

        updatePriceUI(inrRate, priceUsdOunce, binanceRes);

    } catch (error) {
        console.error('Error fetching authentic prices:', error);
        // Fallback to stale cache on error
        if (cachedData) {
            const { data } = JSON.parse(cachedData);
            updatePriceUI(data.inrRate, data.priceUsdOunce, data.binanceData);
        }
    }
}

function updatePriceUI(inrRate, priceUsdOunce, binanceData) {
    let html = '';

    // Process Gold
    if (priceUsdOunce) {
        html += `
            <div class="ticker-item">
                <span class="ticker-symbol">GOLD (NBP Fixed)</span>
                <span class="ticker-price">$${priceUsdOunce.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span class="ticker-change change-positive">FIXED</span>
            </div>
        `;
    }

    // Process Binance Crypto
    binanceData.forEach(item => {
        const symbol = item.symbol.replace('USDT', '');
        const price = parseFloat(item.lastPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const change = parseFloat(item.priceChangePercent).toFixed(2);
        const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
        const arrow = change >= 0 ? '▲' : '▼';

        html += `
            <div class="ticker-item">
                <span class="ticker-symbol">${symbol}</span>
                <span class="ticker-price">${price}</span>
                <span class="ticker-change ${changeClass}">${arrow} ${Math.abs(change)}%</span>
            </div>
        `;
    });

    // Add USD/INR
    html += `
        <div class="ticker-item">
            <span class="ticker-symbol">USD/INR</span>
            <span class="ticker-price">₹${inrRate.toFixed(2)}</span>
        </div>
    `;

    const containers = [
        document.getElementById('crypto-ticker'),
        document.getElementById('home-ticker-container')
    ];

    containers.forEach(container => {
        if (container) {
            container.innerHTML = html + html + html;
        }
    });

    // Update Dedicated Currency Card
    const currencyValueEl = document.getElementById('usd-inr-value');
    const updateTimeEl = document.getElementById('currency-update-time');
    if (currencyValueEl) {
        currencyValueEl.textContent = inrRate.toFixed(4);
    }
    if (updateTimeEl) {
        const now = new Date();
        updateTimeEl.textContent = `Updated: ${now.toLocaleTimeString()}`;
    }
}


async function fetchCryptoNews() {
    const apiKey = 'AKNOELSNWHRCNLCA';
    const topics = 'blockchain';
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&limit=20&apikey=${apiKey}`;

    // Check which page we are on
    const mainContainer = document.getElementById('crypto-news-container');
    const homeContainer = document.getElementById('home-financial-news');

    // If neither exists, exit
    if (!mainContainer && !homeContainer) return;

    const CACHE_KEY = 'crypto_news_cache';
    const CACHE_DURATION = 60 * 60 * 1000;

    // 1. Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, feed } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Serving news from cache');
            if (mainContainer) renderNews(feed);
            if (homeContainer) renderHomeNews(feed);
            return;
        }
    }

    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data["Error Message"]) throw new Error(data["Error Message"]);
        if (data["Information"]) throw new Error(data["Information"]);

        if (!data.feed || data.feed.length === 0) {
            if (cachedData) {
                const { feed } = JSON.parse(cachedData);
                if (mainContainer) renderNews(feed);
                if (homeContainer) renderHomeNews(feed);
                return;
            }
            if (mainContainer) mainContainer.innerHTML = '<div class="error-message">No news available.</div>';
            return;
        }

        // 2. Success - Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            feed: data.feed
        }));

        if (mainContainer) renderNews(data.feed);
        if (homeContainer) renderHomeNews(data.feed);

    } catch (error) {
        console.error('Error fetching crypto news:', error);

        // 3. Fallback to Cache on Error
        if (cachedData) {
            const { feed } = JSON.parse(cachedData);
            if (mainContainer) renderNews(feed);
            if (homeContainer) renderHomeNews(feed);
            return;
        }

        const errorHtml = `
            <div class="error-message">
                <h3>Unable to load news</h3>
                <p>Unable to connect to the news feed.</p>
            </div>
        `;
        if (mainContainer) mainContainer.innerHTML = errorHtml;
        if (homeContainer) homeContainer.innerHTML = errorHtml;
    }
}

// Pagination State (Main Page Only)
let allNewsArticles = [];
let articlesShown = 0;
const ARTICLES_PER_PAGE = 6;
const INITIAL_ARTICLES = 12;

function renderNews(articles) {
    const container = document.getElementById('crypto-news-container');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Initial Load - Store all articles
    if (allNewsArticles.length === 0 && articles.length > 0) {
        allNewsArticles = articles;
        container.innerHTML = ''; // Clear skeleton loader only on first render
        articlesShown = 0; // Reset
    }

    // Determine how many to show this batch
    // If it's the first time, show INITIAL_ARTICLES. Otherwise add PER_PAGE.
    const countToAdd = articlesShown === 0 ? INITIAL_ARTICLES : ARTICLES_PER_PAGE;
    const nextLimit = articlesShown + countToAdd;

    // Slice the specific chunk to append
    const itemsToRender = allNewsArticles.slice(articlesShown, nextLimit);

    itemsToRender.forEach(article => {
        const card = document.createElement('article');
        card.className = 'crypto-card';
        // Fade in effect
        card.style.animation = 'fadeIn 0.5s ease-in-out';

        // Format Date
        const timeStr = article.time_published;
        const date = new Date(
            timeStr.slice(0, 4),
            timeStr.slice(4, 6) - 1,
            timeStr.slice(6, 8),
            timeStr.slice(9, 11),
            timeStr.slice(11, 13)
        );
        const formattedDate = date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Sentiment Logic
        let sentimentClass = 'sentiment-neutral';
        let sentimentLabel = 'Neutral';
        const score = parseFloat(article.overall_sentiment_score);

        if (score >= 0.15) {
            sentimentClass = 'sentiment-bullish';
            sentimentLabel = 'Bullish';
        } else if (score <= -0.15) {
            sentimentClass = 'sentiment-bearish';
            sentimentLabel = 'Bearish';
        }

        // Image Handling
        const imageUrl = article.banner_image || 'https://placehold.co/600x400?text=Crypto+News';

        // Prepare Wrapper Link
        const encodedUrl = encodeURIComponent(article.url);
        const encodedTitle = encodeURIComponent(article.title);
        const wrapperLink = `Financial-news.html?url=${encodedUrl}&title=${encodedTitle}`;

        card.innerHTML = `
            <a href="${wrapperLink}" style="text-decoration: none; color: inherit; display: contents;">
                <img src="${imageUrl}" class="crypto-image" alt="${article.title}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
            </a>
            <div class="crypto-content">
                <div class="crypto-source">
                    <span>${article.source}</span>
                    <span class="crypto-sentiment ${sentimentClass}">${sentimentLabel}</span>
                </div>
                <h3 class="crypto-title">
                    <a href="${wrapperLink}">${article.title}</a>
                </h3>
                <p class="crypto-summary">${article.summary}</p>
                <div class="crypto-meta">
                    ${formattedDate}
                </div>
                <a href="${wrapperLink}" class="btn-learn-more">
                    Read Article &rarr;
                </a>
            </div>
        `;

        container.appendChild(card);
    });

    // Update state
    articlesShown = nextLimit;

    // Button Visibility
    if (articlesShown >= allNewsArticles.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

// Add Event Listener for Load More & Back to Top
document.addEventListener('DOMContentLoaded', () => {
    // Load More Logic
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            const spinner = document.getElementById('news-loading');
            if (spinner) spinner.style.display = 'block';
            loadMoreBtn.style.display = 'none';

            // Simulate small delay for UX
            setTimeout(() => {
                if (spinner) spinner.style.display = 'none';
                renderNews(allNewsArticles); // Logic handles slicing internally based on state
            }, 500);
        });
    }

    // Back to Top Logic
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// --- Homepage Specific Rendering ---
function renderHomeNews(articles) {
    const container = document.getElementById('home-financial-news');
    if (!container) return;

    // Take top 3
    const topArticles = articles.slice(0, 3);
    container.innerHTML = '';

    topArticles.forEach(article => {
        const card = document.createElement('article');
        card.className = 'crypto-card card-home-override';
        card.style.animation = 'fadeIn 0.5s ease-in-out';

        // Format Date
        const timeStr = article.time_published;
        const date = new Date(
            timeStr.slice(0, 4),
            timeStr.slice(4, 6) - 1,
            timeStr.slice(6, 8),
            timeStr.slice(9, 11),
            timeStr.slice(11, 13)
        );
        const formattedDate = date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Sentiment Logic
        let sentimentClass = 'sentiment-neutral';
        let sentimentLabel = 'Neutral';
        const score = parseFloat(article.overall_sentiment_score);
        if (score >= 0.15) {
            sentimentClass = 'sentiment-bullish';
            sentimentLabel = 'Bullish';
        } else if (score <= -0.15) {
            sentimentClass = 'sentiment-bearish';
            sentimentLabel = 'Bearish';
        }

        const imageUrl = article.banner_image || 'https://placehold.co/600x400?text=Crypto+News';
        const encodedUrl = encodeURIComponent(article.url);
        const encodedTitle = encodeURIComponent(article.title);
        const wrapperLink = `Financial-news.html?url=${encodedUrl}&title=${encodedTitle}`;

        card.innerHTML = `
            <a href="${wrapperLink}" style="text-decoration: none; color: inherit; display: contents;">
                <img src="${imageUrl}" class="crypto-image crypto-image-home" alt="${article.title}" 
                     onerror="this.src='https://placehold.co/600x400?text=No+Image'">
            </a>
            <div class="crypto-content crypto-content-home">
                <div class="crypto-source crypto-source-home">
                    <span>${article.source}</span>
                    <span class="crypto-sentiment ${sentimentClass} crypto-sentiment-home">${sentimentLabel}</span>
                </div>
                <h3 class="crypto-title crypto-title-home">
                    <a href="${wrapperLink}">${article.title}</a>
                </h3>
                <div class="crypto-meta crypto-meta-home">
                    ${formattedDate}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}
