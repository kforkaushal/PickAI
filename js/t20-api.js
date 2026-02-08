document.addEventListener('DOMContentLoaded', () => {
    fetchT20Stats();
});

async function fetchT20Stats() {
    const loadingEl = document.getElementById('t20-loading');
    const errorEl = document.getElementById('t20-error');
    const container = document.getElementById('t20-stats-container');

    // API Configuration
    const apiKey = '547a76d7c6msh88b7dff12485ddcp1972c9jsn135c4ad31ad4';
    const apiHost = 'cricbuzz-cricket.p.rapidapi.com';
    // Series ID 6122 (T20 World Cup 2024) - Using stats endpoint
    const seriesId = '6122';
    const url = `https://${apiHost}/stats/v1/series/${seriesId}`;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
        }
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('T20 API Response:', data);

        loadingEl.style.display = 'none';
        container.style.display = 'grid';

        if (data) {
            renderStats(data, container);
        } else {
            throw new Error('No data received');
        }

    } catch (error) {
        console.error('Fetch error:', error);

        // Fallback to Mock Data (since CORS/File protocol blocks RapidAPI in browser)
        console.warn('Falling back to mock data...');
        const mockData = {
            "statId": 99,
            "statName": "Series Stats",
            "seriesId": 6122,
            "seriesName": "ICC Men's T20 World Cup, 2024",
            "leaderboard": [
                {
                    "player_id": "1413",
                    "player_name": "Virat Kohli",
                    "team_name": "India",
                    "team_id": "2",
                    "value": "350 Runs"
                },
                {
                    "player_id": "625",
                    "player_name": "Jos Buttler",
                    "team_name": "England",
                    "team_id": "9",
                    "value": "320 Runs"
                }
            ]
        };

        loadingEl.style.display = 'none';

        // Show Mock Data Warning
        const warning = document.createElement('div');
        warning.style.cssText = 'background: #fff3cd; color: #856404; padding: 10px; margin-bottom: 20px; border-radius: 4px; text-align: center;';
        warning.innerHTML = '<strong>Demo Mode:</strong> showing mock data because live API calls are blocked by browser security (CORS) on local files.';
        container.parentNode.insertBefore(warning, container);

        container.style.display = 'grid';
        renderStats(mockData, container);
    }
}

function renderStats(data, container) {
    // Render Series Info
    if (data.seriesName) {
        const seriesCard = document.createElement('article');
        seriesCard.className = 'analysis-card';
        seriesCard.innerHTML = `
            <span class="category">Series Info</span>
            <h3>${data.seriesName}</h3>
            <div class="meta-text" style="margin-top: 10px;">ID: ${data.seriesId}</div>
        `;
        container.appendChild(seriesCard);
    }

    // Render Leaderboard
    if (data.leaderboard && data.leaderboard.length > 0) {
        const leaderCard = document.createElement('article');
        leaderCard.className = 'analysis-card';
        let itemsHtml = '<ul style="list-style: none; padding: 0; margin-top: 15px;">';

        data.leaderboard.forEach(player => {
            itemsHtml += `
                <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span><strong>${player.player_name}</strong> <small>(${player.team_name})</small></span>
                    <span>${player.value || '-'}</span>
                </li>
            `;
        });
        itemsHtml += '</ul>';

        leaderCard.innerHTML = `
            <span class="category">Stats</span>
            <h3>${data.statName || 'Leaderboard'}</h3>
            ${itemsHtml}
        `;
        container.appendChild(leaderCard);
    } else if (data.statsTypes) {
        data.statsTypes.forEach(stat => {
            const card = document.createElement('article');
            card.className = 'analysis-card';
            card.innerHTML = `
                <span class="category">Stat Category</span>
                <h3>${stat.statName}</h3>
                <div class="meta-text" style="margin-top: 10px;">ID: ${stat.statId}</div>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML += `
            <article class="analysis-card" style="grid-column: 1 / -1;">
                <h3>Raw Response</h3>
                <pre style="text-align: left; background: #f4f4f4; padding: 10px; overflow-x: auto;">
                    ${JSON.stringify(data, null, 2).substring(0, 500)}...
                </pre>
            </article>
        `;
    }
}
