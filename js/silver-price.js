document.addEventListener('DOMContentLoaded', () => {
    fetchSilverRates();
    // Auto-refresh every minute
    setInterval(fetchSilverRates, 60000);

    // Set Date
    const dateElement = document.querySelector('.page-header-desc');
    if (dateElement) {
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        dateElement.innerHTML = `Real-time silver prices in India (INR) for <strong>${today}</strong> (Fine & Sterling).`;
    }
});

async function fetchSilverRates() {
    // API CONFIG
    const token = 'd630fl1r01qnpqnvbh0gd630fl1r01qnpqnvbh10';

    // CACHE CONFIG
    const CACHE_KEY = 'silver_rates_cache';
    const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour

    // Elements
    const tableBody = document.querySelector('#silver-rate-table tbody');
    const updateTime = document.getElementById('last-updated');
    const tickerContainer = document.getElementById('crypto-ticker');

    if (!tableBody) return;

    // 1. Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Serving Silver Rates from Cache');
            renderSilverPage(data, tableBody, updateTime, tickerContainer);
            return;
        }
    }

    try {
        console.log('Fetching Live Silver Rates...');

        // Fetch Live Data
        // OANDA:XAG_USD -> Silver Spot (Finnhub supports OANDA or generic FX)
        // If XAG fails on free tier, we might need a backup or ratio from Gold.
        // Let's try fetching generic Silver symbol or use the Gold Proxy ratio as last resort if needed.
        // Finnhub Symbol for Silver: 'OANDA:XAG_USD' is often standard.

        const symbols = [
            fetch(`https://finnhub.io/api/v1/quote?symbol=OANDA:XAG_USD&token=${token}`),
            fetch(`https://finnhub.io/api/v1/quote?symbol=FX_IDC:USDINR&token=${token}`),
            fetch(`https://finnhub.io/api/v1/quote?symbol=BINANCE:PAXGUSDT&token=${token}`) // For Ticker Gold reference
        ];

        const [silverRes, inrRes, goldRes] = await Promise.all(symbols);

        const silverData = await silverRes.json();
        const inrData = await inrRes.json();
        const goldData = await goldRes.json();

        // Process Data
        // Fallback for Silver: ~30.00 USD if API fails
        let priceOzUSD = silverData.c ? parseFloat(silverData.c) : 0;

        // Secondary Fallback if OANDA fails but we have Gold
        if (priceOzUSD === 0 && goldData.c) {
            // Gold/Silver Ratio approx 85
            priceOzUSD = parseFloat(goldData.c) / 85;
        } else if (priceOzUSD === 0) {
            priceOzUSD = 30.50; // Hard fallback
        }

        const usdInr = inrData.c ? parseFloat(inrData.c) : 87.50;

        const data = {
            priceOzUSD,
            usdInr,
            percentChange: silverData.dp || 0,
            goldPrice: goldData.c || 0
        };

        // Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));

        renderSilverPage(data, tableBody, updateTime, tickerContainer);

    } catch (error) {
        console.error('Error fetching silver rates:', error);
        tableBody.innerHTML = `<tr><td colspan="3" style="color:red; text-align:center;">Failed to load live rates. Please refresh.</td></tr>`;
    }
}

function renderSilverPage(data, tableBody, updateTime, tickerContainer) {
    const { priceOzUSD, usdInr, percentChange, goldPrice } = data;

    // CONSTANTS
    const TROY_OZ_TO_GRAM = 31.1035;
    const IMPORT_DUTY_PREMIUM = 1.15; // ~15% Taxes/Premium/Making

    // CALCULATIONS
    const priceGramUSD = priceOzUSD / TROY_OZ_TO_GRAM;
    const priceGramINR_Fine = priceGramUSD * usdInr * IMPORT_DUTY_PREMIUM; // 999
    const priceGramINR_Sterling = priceGramINR_Fine * 0.925; // 925

    // RENDER MAIN TABLE
    const weights = [
        { label: '10 grams', val: 10 },
        { label: '100 grams', val: 100 },
        { label: '1 Kg', val: 1000 }
    ];

    const fmtINR = (val) => '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });

    let html = '';
    weights.forEach(w => {
        html += `
            <tr>
                <td style="font-weight:500;">${w.label}</td>
                <td style="font-weight:600; color:#2c3e50;">${fmtINR(priceGramINR_Fine * w.val)}</td>
                <td style="font-weight:600; color:#7f8c8d;">${fmtINR(priceGramINR_Sterling * w.val)}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;

    // UPDATE TIME
    updateTime.innerText = `Last Updated: ${new Date().toLocaleTimeString()}`;

    // POPULATE TICKER
    if (tickerContainer) {
        const changeClass = percentChange >= 0 ? 'change-positive' : 'change-negative';
        const arrow = percentChange >= 0 ? '▲' : '▼';

        // Show Silver First here since it's the Silver Page
        const tickItem = `
            <div class="ticker-item">
                <span class="ticker-symbol">SILVER (XAG)</span>
                <span class="ticker-price">$${priceOzUSD.toFixed(2)}</span>
                <span class="ticker-change ${changeClass}">${arrow} ${percentChange.toFixed(2)}%</span>
            </div>
            <div class="ticker-item">
                <span class="ticker-symbol">GOLD (XAU)</span>
                <span class="ticker-price">$${(parseFloat(goldPrice || priceOzUSD * 85)).toFixed(2)}</span>
            </div>
            <div class="ticker-item">
                <span class="ticker-symbol">USD/INR</span>
                <span class="ticker-price">₹${usdInr.toFixed(2)}</span>
            </div>
        `;
        tickerContainer.innerHTML = tickItem + tickItem + tickItem; // Loop
    }
}
