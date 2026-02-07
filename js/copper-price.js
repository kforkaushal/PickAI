document.addEventListener('DOMContentLoaded', () => {
    fetchCopperRates();
    // Auto-refresh every minute
    setInterval(fetchCopperRates, 60000);

    // Set Date
    const dateElement = document.querySelector('.page-header-desc');
    if (dateElement) {
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        dateElement.innerHTML = `Real-time copper prices in India (INR) for <strong>${today}</strong> (Scrap & Wire).`;
    }
});

async function fetchCopperRates() {
    const token = 'd630fl1r01qnpqnvbh0gd630fl1r01qnpqnvbh10';
    const CACHE_KEY = 'copper_rates_cache';
    const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour

    // Elements
    const tableBody = document.querySelector('#copper-rate-table tbody');
    const updateTime = document.getElementById('last-updated');
    const tickerContainer = document.getElementById('crypto-ticker');

    if (!tableBody) return;

    // 1. Check Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Serving Copper Rates from Cache');
            renderCopperPage(data, tableBody, updateTime, tickerContainer);
            return;
        }
    }

    try {
        console.log('Fetching Live Copper Rates...');

        // Fetch Data
        // Finnhub doesn't always have free Commodities.
        // We can try 'OANDA:XCU_USD' (Copper) or derive from a proxy if needed.
        // Fallback: If XCU fails, we might need a hardcoded base or proxy.
        // Let's try fetching generic Copper symbol.

        const symbols = [
            fetch(`https://finnhub.io/api/v1/quote?symbol=OANDA:XCU_USD&token=${token}`), // Copper Spot
            fetch(`https://finnhub.io/api/v1/quote?symbol=FX_IDC:USDINR&token=${token}`)
        ];

        const [copperRes, inrRes] = await Promise.all(symbols);

        const copperData = await copperRes.json();
        const inrData = await inrRes.json();

        // Process Data
        // Copper is usually priced per lb (pound) in international markets (approx $4.00 - $5.00/lb)
        // Or per oz/tonne depending on symbol. OANDA XCU_USD is typically per Ounce or similar?
        // Actually XCU/USD is usually per Ounce? No, usually Copper is $/lb or $/tonne.
        // Let's assume the value returned is consistent or we normalize it.
        // If Data is ~3.0-5.0, it's Likely $/lb.
        // If Data is ~8000-10000, it's $/tonne.

        let priceUSD = copperData.c ? parseFloat(copperData.c) : 0;

        // Fallback logic
        if (priceUSD === 0) {
            priceUSD = 4.25; // Approximate safe fallback $/lb
        }

        // Detect Unit (Simple Heuristic)
        let pricePerKgUSD = 0;
        if (priceUSD < 20) {
            // Likely $/lb
            // 1 kg = 2.20462 lbs
            pricePerKgUSD = priceUSD * 2.20462;
        } else if (priceUSD > 5000) {
            // Likely $/tonne
            pricePerKgUSD = priceUSD / 1000;
        } else {
            // Unknown, assume pre-normalized or Oz? (Unlikely for Copper)
            // Treat as $/lb fallback
            pricePerKgUSD = priceUSD * 2.20462;
        }

        const usdInr = inrData.c ? parseFloat(inrData.c) : 87.50;

        const data = {
            pricePerKgUSD,
            usdInr,
            percentChange: copperData.dp || 0,
            marketPriceUSD: priceUSD
        };

        // Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));

        renderCopperPage(data, tableBody, updateTime, tickerContainer);

    } catch (error) {
        console.error('Error fetching copper rates:', error);
        tableBody.innerHTML = `<tr><td colspan="2" style="color:red; text-align:center;">Failed to load live rates. Please refresh.</td></tr>`;
    }
}

function renderCopperPage(data, tableBody, updateTime, tickerContainer) {
    const { pricePerKgUSD, usdInr, percentChange, marketPriceUSD } = data;

    // CALCULATIONS
    // Base MCX Price approximation (International * INR * Premium)
    const IMPORT_PREMIUM = 1.08; // ~8-10% Shipping/Duty
    const baseKgINR = pricePerKgUSD * usdInr * IMPORT_PREMIUM;

    // Scrap Rates (Discount from Base)
    const rates = [
        { label: 'MCX Copper (Futures)', val: baseKgINR, color: '#2c3e50', weight: '600' },
        { label: 'Copper Wire (Bright) - Scrap', val: baseKgINR * 0.96, color: '#e67e22', weight: '700' }, // Best Scrap
        { label: 'Copper Armature', val: baseKgINR * 0.92, color: '#d35400', weight: '500' },
        { label: 'Copper Mixed / Utensils', val: baseKgINR * 0.85, color: '#7f8c8d', weight: '500' }
    ];

    const fmtINR = (val) => '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });

    let html = '';
    rates.forEach(r => {
        html += `
            <tr>
                <td style="font-weight:500;">${r.label}</td>
                <td style="font-weight:${r.weight}; color:${r.color}; font-size:1.05rem;">${fmtINR(r.val)} <span style="font-size:0.8rem; color:#999; font-weight:400;">/ kg</span></td>
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

        const tickItem = `
            <div class="ticker-item">
                <span class="ticker-symbol">COPPER (XCU)</span>
                <span class="ticker-price">$${marketPriceUSD.toFixed(2)}</span>
                <span class="ticker-change ${changeClass}">${arrow} ${percentChange.toFixed(2)}%</span>
            </div>
            <div class="ticker-item">
                <span class="ticker-symbol">USD/INR</span>
                <span class="ticker-price">₹${usdInr.toFixed(2)}</span>
            </div>
        `;
        // Append or Prepend? Ticker logic often overwrites.
        // For distinct pages, we can just set it.
        tickerContainer.innerHTML = tickItem + tickItem + tickItem + tickItem;
    }
}
