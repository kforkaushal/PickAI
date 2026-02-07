document.addEventListener('DOMContentLoaded', () => {
    fetchCryptoPrices(); // Finnhub Live Feed
    fetchCryptoNews(); // Alpha Vantage News

    // Auto-refresh prices every 60 seconds
    setInterval(fetchCryptoPrices, 60000);
});

async function fetchCryptoPrices() {
    const token = 'd630fl1r01qnpqnvbh0gd630fl1r01qnpqnvbh10';
    const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'ADA'];

    // Check for containers
    const mainTicker = document.getElementById('crypto-ticker');
    const homeTicker = document.getElementById('home-ticker-container');

    if (!mainTicker && !homeTicker) return;

    try {
        // 1. Fetch Crypto
        const cryptoPromises = cryptoSymbols.map(sym =>
            fetch(`https://finnhub.io/api/v1/quote?symbol=BINANCE:${sym}USDT&token=${token}`)
                .then(res => res.json())
                .then(data => ({ symbol: sym, ...data, type: 'crypto' }))
        );

        // 2. Fetch Gold/Silver/INR
        // Using Generic/OANDA symbols
        const marketPromises = [
            fetch(`https://finnhub.io/api/v1/quote?symbol=BINANCE:PAXGUSDT&token=${token}`) // Gold Proxy
                .then(res => res.json())
                .then(data => ({ symbol: 'GOLD', ...data, type: 'comm' })),
            fetch(`https://finnhub.io/api/v1/quote?symbol=FX_IDC:USDINR&token=${token}`)
                .then(res => res.json())
                .then(data => ({ symbol: 'USD/INR', ...data, type: 'forex' }))
        ];

        const results = await Promise.all([...marketPromises, ...cryptoPromises]);

        // Build HTML
        let html = '';
        results.forEach(item => {
            if (!item.c) return;

            let priceStr = '';
            let label = item.symbol;

            if (item.type === 'crypto') {
                priceStr = parseFloat(item.c).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            } else if (item.symbol === 'GOLD') {
                label = 'GOLD (XAU)';
                priceStr = '$' + parseFloat(item.c).toFixed(2);
            } else if (item.symbol === 'USD/INR') {
                priceStr = '₹' + parseFloat(item.c).toFixed(2);
            }

            const change = parseFloat(item.dp).toFixed(2);
            const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
            const arrow = change >= 0 ? '▲' : '▼';

            html += `
                <div class="ticker-item">
                    <span class="ticker-symbol">${label}</span>
                    <span class="ticker-price">${priceStr}</span>
                    <span class="ticker-change ${changeClass}">${arrow} ${Math.abs(change)}%</span>
                </div>
            `;
        });

        // Add Silver manually (approx ratio or fixed fallback if no API)
        // Silver ~ 1/85 of Gold if actual API fails widely
        // For now, let's skip Silver in main ticker to keep it fast, or add static if needed.
        // Adding Silver via visual estimation logic from Silver Page is complex here without duplicating code.
        // We'll stick to Gold/USDINR/Crypto for the main ticker as they are high impact.

        // Loop through all potential ticker containers
        const containers = [
            document.getElementById('crypto-ticker'),
            document.getElementById('home-ticker-container')
        ];

        containers.forEach(container => {
            if (container) {
                container.innerHTML = html + html + html; // Infinite scroll dupes
            }
        });

    } catch (error) {
        console.error('Error fetching prices:', error);
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
