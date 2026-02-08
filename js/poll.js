
document.addEventListener('DOMContentLoaded', () => {
    const pollOptions = document.querySelectorAll('.poll-option');
    const pollCard = document.getElementById('poll-card');
    const pollOptionsContainer = document.getElementById('poll-options');
    const pollResultsContainer = document.getElementById('poll-results');
    const resultsList = document.getElementById('results-list');

    // Initial Mock Data with Logos
    const mockResults = {
        claude: {
            name: 'Claude 3.5 Sonnet',
            votes: 420,
            logo: 'https://img.logo.dev/anthropic.com?token=pk_Y3y_C1R3S8S3R3S8S3R3'
        },
        gpt: {
            name: 'GPT-4o',
            votes: 315,
            logo: 'https://img.logo.dev/openai.com?token=pk_Y3y_C1R3S8S3R3S8S3R3'
        },
        gemini: {
            name: 'Gemini 1.5 Pro',
            votes: 158,
            logo: 'https://img.logo.dev/google.com?token=pk_Y3y_C1R3S8S3R3S8S3R3'
        },
        deepseek: {
            name: 'DeepSeek V3',
            votes: 210,
            logo: 'https://img.logo.dev/deepseek.com?token=pk_Y3y_C1R3S8S3R3S8S3R3'
        }
    };

    // Archive Data
    const archivePolls = [
        { date: 'Feb 07', question: 'Favorite JS Framework for 2026?', winner: 'Next.js', total: '2,401 votes' },
        { date: 'Feb 06', question: 'Best UI Design Tool?', winner: 'Figma', total: '1,850 votes' },
        { date: 'Feb 05', question: 'Primary Cloud Provider?', winner: 'AWS', total: '3,120 votes' }
    ];

    // Check if already voted
    const hasVoted = localStorage.getItem('pickai_poll_voted');
    if (hasVoted) {
        showResults(hasVoted);
    }

    pollOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selection = option.getAttribute('data-option');
            handleVote(selection);
        });
    });

    // Archive Toggle logic
    const archiveBtn = document.getElementById('change-vote');
    if (archiveBtn) {
        archiveBtn.addEventListener('click', () => {
            const archiveSection = document.getElementById('poll-archive');
            if (archiveSection) {
                archiveSection.classList.toggle('active');
                if (archiveSection.classList.contains('active')) {
                    archiveBtn.innerHTML = 'Close Archive &uarr;';
                    renderArchive();
                } else {
                    archiveBtn.innerHTML = 'Interested in other polls? Check Archive &rarr;';
                }
            }
        });
    }

    function handleVote(selection) {
        const selectedBtn = document.querySelector(`[data-option="${selection}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('voted-flash');
        }

        setTimeout(() => {
            localStorage.setItem('pickai_poll_voted', selection);
            showResults(selection);
        }, 600);
    }

    function showResults(selection) {
        pollOptionsContainer.style.display = 'none';
        pollResultsContainer.style.display = 'block';
        resultsList.innerHTML = '';

        if (mockResults[selection]) {
            mockResults[selection].votes += 1;
        }

        const totalVotes = Object.values(mockResults).reduce((sum, item) => sum + item.votes, 0);

        Object.keys(mockResults).forEach(key => {
            const item = mockResults[key];
            const percentage = Math.round((item.votes / totalVotes) * 100);

            const resultHtml = `
                <div class="result-item ${key === selection ? 'user-selection' : ''}">
                    <div class="result-label">
                        <div class="result-info">
                            <img src="${item.logo}" class="result-logo" alt="${item.name}">
                            <span>${item.name}</span>
                        </div>
                        <span class="percentage">${percentage}%</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: 0%;" data-target="${percentage}"></div>
                    </div>
                </div>
            `;
            resultsList.insertAdjacentHTML('beforeend', resultHtml);
        });

        setTimeout(() => {
            const bars = document.querySelectorAll('.progress-bar');
            bars.forEach(bar => {
                const target = bar.getAttribute('data-target');
                bar.style.width = `${target}%`;
            });
        }, 100);
    }

    function renderArchive() {
        const archiveList = document.getElementById('archive-list');
        if (!archiveList) return;

        archiveList.innerHTML = archivePolls.map(poll => `
            <div class="archive-item">
                <div class="archive-meta">
                    <span class="archive-date">${poll.date}</span>
                    <span class="archive-votes">${poll.total}</span>
                </div>
                <h4>${poll.question}</h4>
                <p>Winner: <strong>${poll.winner}</strong></p>
            </div>
        `).join('');
    }
});
