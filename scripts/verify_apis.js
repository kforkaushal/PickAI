const https = require('https');

const apis = [
    { name: 'Binance', url: 'https://api4.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]' },
    { name: 'NBP Gold', url: 'https://api.nbp.pl/api/cenyzlota/last/1/?format=json' },
    { name: 'ExchangeRate', url: 'https://v6.exchangerate-api.com/v6/effff990e7bcd506495b1b0d/latest/USD' }
];

async function checkApi(api) {
    return new Promise((resolve) => {
        https.get(api.url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`\n--- ${api.name} ---`);
                console.log(`Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    if (api.name === 'ExchangeRate') {
                        console.log(`USD to INR: ${json.conversion_rates ? json.conversion_rates.INR : 'MISSING'}`);
                    } else if (api.name === 'NBP Gold') {
                        console.log(`Gold Price (PLN/g): ${json[0] ? json[0].cena : 'MISSING'}`);
                    } else if (api.name === 'Binance') {
                        console.log(`BTC Last Price: ${json[0] ? json[0].lastPrice : 'MISSING'}`);
                    }
                } catch (e) {
                    console.log('Error parsing JSON');
                }
                resolve();
            });
        }).on('error', (err) => {
            console.log(`Error fetching ${api.name}: ${err.message}`);
            resolve();
        });
    });
}

async function run() {
    for (const api of apis) {
        await checkApi(api);
    }
}

run();
