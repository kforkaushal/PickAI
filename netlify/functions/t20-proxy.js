exports.handler = async function (event, context) {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const apiKey = '547a76d7c6msh88b7dff12485ddcp1972c9jsn135c4ad31ad4';
    const apiHost = 'cricbuzz-cricket.p.rapidapi.com';
    const seriesId = '6122';
    const url = `https://${apiHost}/stats/v1/series/${seriesId}`;

    try {
        // Use native fetch (available in Node.js 18+ on Netlify)
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Upstream API Error: ${response.statusText}` }),
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                // Allow requests from your domain (or * for public)
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Proxy Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};
