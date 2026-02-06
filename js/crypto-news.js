document.addEventListener('DOMContentLoaded', () => {
    fetchCryptoPrices(); // Finnhub Live Feed
    fetchCryptoNews(); // Alpha Vantage News

    // Auto-refresh prices every 60 seconds
    setInterval(fetchCryptoPrices, 60000);
});

async function fetchCryptoPrices() {
    const token = 'd630fl1r01qnpqnvbh0gd630fl1r01qnpqnvbh10';
    const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE', 'XRP', 'BNB'];
    const tickerContainer = document.getElementById('crypto-ticker');

    if (!tickerContainer) return;

    try {
        // Fetch specific symbols from Binance via Finnhub
        // Note: Free tier has rate limits (30 calls/sec), so Promise.all is fine for 7 items.
        const promises = symbols.map(sym =>
            fetch(`https://finnhub.io/api/v1/quote?symbol=BINANCE:${sym}USDT&token=${token}`)
                .then(res => res.json())
                .then(data => ({ symbol: sym, ...data }))
        );

        const results = await Promise.all(promises);

        // Build HTML
        let html = '';
        results.forEach(coin => {
            // Finnhub Quote: c = current price, dp = percent change
            if (!coin.c) return; // Skip if error

            const price = parseFloat(coin.c).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            const change = parseFloat(coin.dp).toFixed(2);
            const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
            const arrow = change >= 0 ? '▲' : '▼';

            html += `
                <div class="ticker-item">
                    <span class="ticker-symbol">${coin.symbol}</span>
                    <span class="ticker-price">${price}</span>
                    <span class="ticker-change ${changeClass}">${arrow} ${Math.abs(change)}%</span>
                </div>
            `;
        });

        // Duplicate content for smooth infinite scroll
        tickerContainer.innerHTML = html + html + html;

    } catch (error) {
        console.error('Error fetching crypto prices:', error);
    }
}


async function fetchCryptoNews() {
    const apiKey = 'AKNOELSNWHRCNLCA';
    const topics = 'blockchain';
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&limit=20&apikey=${apiKey}`;
    const container = document.getElementById('crypto-news-container');
    const CACHE_KEY = 'crypto_news_cache';
    const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

    // 1. Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, feed } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Serving news from cache');
            renderNews(feed);
            return;
        }
    }

    try {
        const response = await fetch(url);

        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle API specific error messages or empty data
        if (data["Error Message"]) { // Invalid API Call
            throw new Error(data["Error Message"]);
        }
        if (data["Information"]) { // Rate Limit
            throw new Error(data["Information"]);
        }

        if (!data.feed || data.feed.length === 0) {
            // If API returns empty but we have old cache, show that instead implies better UX
            if (cachedData) {
                console.warn('API empty, falling back to cache');
                const { feed } = JSON.parse(cachedData);
                renderNews(feed);
                return;
            }
            container.innerHTML = '<div class="error-message">No news available at the moment.</div>';
            return;
        }

        // 2. Success - Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            feed: data.feed
        }));

        renderNews(data.feed);

    } catch (error) {
        console.error('Error fetching crypto news:', error);

        // 3. Fallback to Cache on Error
        if (cachedData) {
            console.warn('API error, serving cached data');
            const { feed } = JSON.parse(cachedData);
            renderNews(feed);

            // Optional: Show a small toast/banner saying "Showing cached data"
            return;
        }

        container.innerHTML = `
            <div class="error-message">
                <h3>Unable to load news</h3>
                <p>${error.message.includes('Note') || error.message.includes('Information') ? 'API rate limit reached. Please try again later.' : 'Unable to connect to the news feed.'}</p>
            </div>
        `;
    }
}

// Pagination State
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
        const wrapperLink = `Financial-news?url=${encodedUrl}&title=${encodedTitle}`;

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
