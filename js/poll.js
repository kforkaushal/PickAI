
document.addEventListener('DOMContentLoaded', () => {
    const pollOptionsContainer = document.getElementById('poll-options');
    const pollResultsContainer = document.getElementById('poll-results');
    const resultsList = document.getElementById('results-list');
    const questionEl = document.getElementById('daily-question');

    // --- 7-Day Poll Dataset ---
    const DAILY_POLLS = [
        {
            id: 'ai-assistants',
            question: "Which AI Assistant is currently your primary choice for coding?",
            options: {
                claude: { name: 'Claude 3.5 Sonnet', desc: 'Superior reasoning and coding.', logo: 'anthropic.com', votes: 0 },
                gpt: { name: 'GPT-4o', desc: 'Versatile and flagship performance.', logo: 'openai.com', votes: 0 },
                gemini: { name: 'Gemini 1.5 Pro', desc: 'Massive context and ecosystem.', logo: 'google.com', votes: 0 },
                deepseek: { name: 'DeepSeek V3', desc: 'Powerful open-source reasoning.', logo: 'deepseek.com', votes: 0 }
            }
        },
        {
            id: 'cloud-llm',
            question: "Preferred Cloud Platform for LLM deployment?",
            options: {
                aws: { name: 'AWS Bedrock', desc: 'Scalable enterprise AI.', logo: 'aws.amazon.com', votes: 0 },
                azure: { name: 'Azure AI', desc: 'Deep Microsoft integration.', logo: 'microsoft.com', votes: 0 },
                gcp: { name: 'Google Cloud Vertex', desc: 'Cutting-edge ML ops.', logo: 'google.com', votes: 0 },
                hf: { name: 'Hugging Face Inference', desc: 'Community-first open models.', logo: 'huggingface.co', votes: 0 }
            }
        },
        {
            id: 'llm-frameworks',
            question: "Most effective framework for building AI agents?",
            options: {
                langchain: { name: 'LangChain', desc: 'Comprehensive tool chaining.', logo: 'langchain.com', votes: 0 },
                llamaindex: { name: 'LlamaIndex', desc: 'Data-centric RAG focus.', logo: 'llamaindex.ai', votes: 0 },
                autogen: { name: 'AutoGen', desc: 'Multi-agent orchestration.', logo: 'microsoft.com', votes: 0 },
                crewai: { name: 'CrewAI', desc: 'Production-ready agents.', logo: 'crewai.com', votes: 0 }
            }
        },
        {
            id: 'vector-dbs',
            question: "Which Vector DB leads your technical stack?",
            options: {
                pinecone: { name: 'Pinecone', desc: 'Managed serverless scale.', logo: 'pinecone.io', votes: 0 },
                weaviate: { name: 'Weaviate', desc: 'Cloud-native vector search.', logo: 'weaviate.io', votes: 0 },
                milvus: { name: 'Milvus', desc: 'Enterprise-grade open source.', logo: 'zilliz.com', votes: 0 },
                mongodb: { name: 'MongoDB Atlas', desc: 'Universal document-vector.', logo: 'mongodb.com', votes: 0 }
            }
        },
        {
            id: 'ai-hardware',
            question: "Best hardware for locally running small LLMs?",
            options: {
                nvidia: { name: 'NVIDIA RTX 4090', desc: 'The gold standard for CUDA.', logo: 'nvidia.com', votes: 0 },
                apple: { name: 'Apple M4 Max', desc: 'Unified memory efficiency.', logo: 'apple.com', votes: 0 },
                amd: { name: 'AMD Radeon 7900', desc: 'Strong ROCm alternative.', logo: 'amd.com', votes: 0 },
                groq: { name: 'Groq LPU', desc: 'Ultra-fast inference tech.', logo: 'groq.com', votes: 0 }
            }
        },
        {
            id: 'future-ai',
            question: "What is the most critical AI development for 2026?",
            options: {
                agi: { name: 'AGI Breakthrough', desc: 'General intelligence parity.', logo: 'openai.com', votes: 0 },
                agents: { name: 'Autonomous Agents', desc: 'Seamless task automation.', logo: 'anthropic.com', votes: 0 },
                privacy: { name: 'Local/Edge AI', desc: 'Privacy-first processing.', logo: 'apple.com', votes: 0 },
                safety: { name: 'AI Alignment', desc: 'Robust safety guardrails.', logo: 'google.com', votes: 0 }
            }
        },
        {
            id: 'ai-ethics',
            question: "Primary concern in AI development today?",
            options: {
                bias: { name: 'Bias & Fairness', desc: 'Model neutrality issues.', logo: 'microsoft.com', votes: 0 },
                jobs: { name: 'Job Displacement', desc: 'Economic impact concerns.', logo: 'nvidia.com', votes: 0 },
                energy: { name: 'Sustainability', desc: 'Training energy consumption.', logo: 'meta.com', votes: 0 },
                control: { name: 'Model Control', desc: 'Governance and oversight.', logo: 'mistral.ai', votes: 0 }
            }
        }
    ];

    const API_TOKEN = 'pk_Mg3XAPU3QqSkLxHtf5tWww';

    // --- Persistence & Rotation Logic ---
    function getTodayPoll() {
        const dayIndex = Math.floor(Date.now() / 8.64e7) % DAILY_POLLS.length;
        const poll = DAILY_POLLS[dayIndex];

        const persistedCounts = localStorage.getItem(`pickai_poll_counts_${poll.id}`);
        if (persistedCounts) {
            const counts = JSON.parse(persistedCounts);
            Object.keys(poll.options).forEach(key => {
                if (counts[key] !== undefined) {
                    poll.options[key].votes = counts[key];
                }
            });
        }
        return poll;
    }

    let currentPoll = getTodayPoll();
    const pollId = currentPoll.id;
    const voteKey = `pickai_poll_voted_${pollId}`;
    const countsKey = `pickai_poll_counts_${pollId}`;

    function persistCounts() {
        const counts = {};
        Object.keys(currentPoll.options).forEach(key => {
            counts[key] = currentPoll.options[key].votes;
        });
        localStorage.setItem(countsKey, JSON.stringify(counts));
    }

    // --- Display Logic ---
    function initPoll() {
        questionEl.textContent = currentPoll.question;
        const hasVoted = localStorage.getItem(voteKey);

        if (hasVoted) {
            showThankYou();
        } else {
            renderOptions();
        }
    }

    function renderOptions() {
        pollOptionsContainer.innerHTML = '';
        Object.keys(currentPoll.options).forEach(key => {
            const opt = currentPoll.options[key];
            const optionHtml = `
                <button class="poll-option" data-option="${key}">
                    <div class="option-logo">
                        <img src="https://img.logo.dev/${opt.logo}?token=${API_TOKEN}" 
                             alt="${opt.name} Logo"
                             onerror="this.src='https://ui-avatars.com/api/?name=${opt.name.charAt(0)}&background=f5f5f5&color=000'">
                    </div>
                    <div class="option-info">
                        <span class="option-name">${opt.name}</span>
                        <span class="option-desc">${opt.desc}</span>
                    </div>
                    <div class="vote-indicator"></div>
                </button>
            `;
            pollOptionsContainer.insertAdjacentHTML('beforeend', optionHtml);
        });

        const pollOptions = document.querySelectorAll('.poll-option');
        pollOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selection = option.getAttribute('data-option');
                handleVote(selection);
            });
        });
    }

    function handleVote(selection) {
        const selectedBtn = document.querySelector(`[data-option="${selection}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('voted-flash');
        }

        setTimeout(() => {
            localStorage.setItem(voteKey, selection);
            if (currentPoll.options[selection]) {
                currentPoll.options[selection].votes += 1;
                persistCounts();
            }
            showThankYou();
        }, 600);
    }

    function showThankYou() {
        pollOptionsContainer.style.display = 'none';
        pollResultsContainer.style.display = 'block';

        const resultsHeader = pollResultsContainer.querySelector('h3');
        if (resultsHeader) {
            resultsHeader.textContent = 'Submission Received';
        }

        resultsList.innerHTML = `
            <div class="poll-completion">
                <div class="completion-icon">✅</div>
                <p class="completion-title">Thank You for Voting</p>
                <p class="completion-message">
                    Your response has been recorded. We use these insights to shape our editorial coverage and industry analysis.
                </p>
                <div class="completion-footer">
                    <p class="countdown-label">
                        Next Intelligence Poll in <span id="poll-countdown">--:--:--</span>
                    </p>
                </div>
            </div>
        `;

        startCountdown();
    }

    function startCountdown() {
        const countdownEl = document.getElementById('poll-countdown');
        if (!countdownEl) return;

        function update() {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setUTCHours(24, 0, 0, 0);

            const diff = tomorrow - now;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            countdownEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        update();
        setInterval(update, 1000);
    }

    // --- Archive Logic (Simplified to questions only) ---
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

    function renderArchive() {
        const archiveList = document.getElementById('archive-list');
        if (!archiveList) return;

        const otherPolls = DAILY_POLLS.filter(p => p.id !== pollId);

        archiveList.innerHTML = otherPolls.slice(0, 3).map(poll => {
            return `
                <div class="archive-item">
                    <div class="archive-meta">
                        <span class="archive-date">PREVIOUS POLL</span>
                    </div>
                    <h4 style="font-family: var(--font-serif); margin-bottom: 10px;">${poll.question}</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-meta);">This poll closed with entries from our global community.</p>
                </div>
            `;
        }).join('');
    }

    initPoll();
});
