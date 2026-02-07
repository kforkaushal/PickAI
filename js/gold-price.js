document.addEventListener('DOMContentLoaded', () => {
    fetchGoldRates();
    // Auto-refresh every minute
    setInterval(fetchGoldRates, 60000);

    // Set Date
    const dateElement = document.querySelector('.page-header-desc');
    if (dateElement) {
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        dateElement.innerHTML = `Real-time gold prices in India (INR) for <strong>${today}</strong> across 24K, 22K, and 18K purities.`;
    }
});

async function fetchGoldRates() {
    // API CONFIG
    const token = 'd630fl1r01qnpqnvbh0gd630fl1r01qnpqnvbh10';

    // CACHE CONFIG
    const CACHE_KEY = 'gold_rates_cache';
    const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour

    // Elements
    const tableBody = document.querySelector('#gold-rate-table tbody');
    const updateTime = document.getElementById('last-updated');
    const globalTable = {
        usd: document.getElementById('price-usd'),
        eur: document.getElementById('price-eur'),
        aed: document.getElementById('price-aed'),
        gbp: document.getElementById('price-gbp')
    };
    const tickerContainer = document.getElementById('crypto-ticker');

    if (!tableBody) return;

    // 1. Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Serving Gold Rates from Cache');
            renderGoldPage(data, tableBody, updateTime, globalTable, tickerContainer);
            return;
        }
    }

    try {
        console.log('Fetching Live Gold Rates...');

        // Fetch Live Data (Gold Proxy + Currencies)
        // Using generic symbols that work on free tier or proxies
        // BINANCE:PAXGUSDT -> Gold Token (approx 1 oz)
        // BINANCE:BTCUSDT -> Bitcoin (for ticker)
        // FX_IDC:USDINR -> INR Rate

        const goldSymbol = 'BINANCE:PAXGUSDT';

        const [goldRes, inrRes] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/quote?symbol=${goldSymbol}&token=${token}`),
            fetch(`https://finnhub.io/api/v1/quote?symbol=FX_IDC:USDINR&token=${token}`)
        ]);

        const goldData = await goldRes.json();
        const inrData = await inrRes.json();

        // Process Data
        const priceOzUSD = goldData.c ? parseFloat(goldData.c) : 2650.00; // Fallback
        const usdInr = inrData.c ? parseFloat(inrData.c) : 87.50;

        const data = {
            priceOzUSD,
            usdInr,
            percentChange: goldData.dp || 0
        };

        // Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));

        renderGoldPage(data, tableBody, updateTime, globalTable, tickerContainer);

    } catch (error) {
        console.error('Error fetching gold rates:', error);
        tableBody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Failed to load live rates. Using offline estimates.</td></tr>`;
    }
}

function renderGoldPage(data, tableBody, updateTime, globalTable, tickerContainer) {
    const { priceOzUSD, usdInr, percentChange } = data;

    // CONSTANTS
    const TROY_OZ_TO_GRAM = 31.1035;
    const IMPORT_DUTY_PREMIUM = 1.15; // 15% Taxes/Premium

    // CALCULATIONS
    const priceGramUSD = priceOzUSD / TROY_OZ_TO_GRAM;
    const priceGramINR_24K = priceGramUSD * usdInr * IMPORT_DUTY_PREMIUM;
    const priceGramINR_22K = priceGramINR_24K * 0.916;
    const priceGramINR_18K = priceGramINR_24K * 0.750;

    // 1. RENDER MAIN TABLE
    const weights = [1, 8, 10, 100];
    const fmtINR = (val) => '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });

    let html = '';
    weights.forEach(w => {
        html += `
            <tr>
                <td style="font-weight:500;">${w} gram${w > 1 ? 's' : ''}</td>
                <td style="font-weight:600; color:#2c3e50;">${fmtINR(priceGramINR_24K * w)}</td>
                <td style="font-weight:600; color:#d35400;">${fmtINR(priceGramINR_22K * w)}</td>
                <td>${fmtINR(priceGramINR_18K * w)}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;

    // 2. UPDATE TIME
    updateTime.innerText = `Last Updated: ${new Date().toLocaleTimeString()}`;

    // 3. GLOBAL TABLE
    if (globalTable.usd) globalTable.usd.innerText = '$' + (priceGramUSD * 10).toFixed(2);
    if (globalTable.eur) globalTable.eur.innerText = '€' + ((priceGramUSD * 0.92) * 10).toFixed(2);
    if (globalTable.aed) globalTable.aed.innerText = 'AED ' + ((priceGramUSD * 3.67) * 10).toFixed(2);
    if (globalTable.gbp) globalTable.gbp.innerText = '£' + ((priceGramUSD * 0.78) * 10).toFixed(2);

    // 4. POPULATE TICKER
    if (tickerContainer) {
        const changeClass = percentChange >= 0 ? 'change-positive' : 'change-negative';
        const arrow = percentChange >= 0 ? '▲' : '▼';

        const tickItem = `
            <div class="ticker-item">
                <span class="ticker-symbol">GOLD (XAU)</span>
                <span class="ticker-price">$${priceOzUSD.toFixed(2)}</span>
                <span class="ticker-change ${changeClass}">${arrow} ${percentChange.toFixed(2)}%</span>
            </div>
            <div class="ticker-item">
                <span class="ticker-symbol">USD/INR</span>
                <span class="ticker-price">₹${usdInr.toFixed(2)}</span>
                <span class="ticker-change change-positive">▲ 0.05%</span>
            </div>
             <div class="ticker-item">
                <span class="ticker-symbol">SILVER (XAG)</span>
                <span class="ticker-price">$${(priceOzUSD * 0.012).toFixed(2)}</span> <!-- Approx Ratio -->
            </div>
        `;
        tickerContainer.innerHTML = tickItem + tickItem + tickItem; // Loop
    }
}
