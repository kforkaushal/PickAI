document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
});

let searchData = {
    tools: [],
    news: []
};

async function initializeSearch() {
    // 1. Inject Overlay HTML
    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
        <div class="search-modal">
            <div class="search-header">
                <svg class="search-icon-input" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" id="global-search-input" placeholder="Search tools, news, or research..." autocomplete="off">
                <button id="close-search" class="close-btn">&times;</button>
            </div>
            <div class="search-results" id="search-results">
                <div class="empty-state">Start typing to search...</div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 2. Bind Events
    const openBtns = document.querySelectorAll('.search-icon'); // Header icon
    const closeBtn = document.getElementById('close-search');
    const input = document.getElementById('global-search-input');
    const overlayEl = document.getElementById('search-overlay');

    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if it's a link
            openSearch();
        });
        // Also make parent container clickable if SVG is small
        if (btn.parentElement.classList.contains('header-actions')) {
            btn.parentElement.addEventListener('click', () => openSearch());
        }
    });

    closeBtn.addEventListener('click', closeSearch);

    // Close on click outside
    overlayEl.addEventListener('click', (e) => {
        if (e.target === overlayEl) closeSearch();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlayEl.classList.contains('active')) closeSearch();
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });

    input.addEventListener('input', (e) => handleSearch(e.target.value));

    // 3. Bind Sidebar Search (New)
    const sidebarForm = document.querySelector('.sidebar-search form');
    const sidebarInput = document.querySelector('.sidebar-search input');

    if (sidebarForm) {
        sidebarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = sidebarInput.value;
            if (query) {
                openSearch();
                const globalInput = document.getElementById('global-search-input');
                if (globalInput) {
                    globalInput.value = query;
                    handleSearch(query);
                }
                // Close sidebar if open
                document.querySelector('.sidebar-menu')?.classList.remove('active');
                document.querySelector('.sidebar-overlay')?.classList.remove('active');
            }
        });
    }

    if (sidebarInput) {
        sidebarInput.addEventListener('focus', () => {
            // Optional: User clicks sidebar input -> open global search immediately? 
            // Or let them type? Let's let them type, but maybe mirror to global?
            // Simpler: Redirect focus to global search
            openSearch();
            const globalInput = document.getElementById('global-search-input');
            if (globalInput) {
                globalInput.value = sidebarInput.value;
                globalInput.focus();
            }
            // Close sidebar to show results overlay clearly
            document.querySelector('.sidebar-menu')?.classList.remove('active');
            document.querySelector('.sidebar-overlay')?.classList.remove('active');
        });
    }

    // 4. Pre-fetch Data
    await loadSearchData();
}

function openSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('global-search-input');
    overlay.classList.add('active');
    setTimeout(() => input.focus(), 100);
}

function closeSearch() {
    const overlay = document.getElementById('search-overlay');
    overlay.classList.remove('active');
}

async function loadSearchData() {
    // Determine path prefix based on current location depth
    // Works for file://, localhost, and production paths
    let prefix = './';
    const path = window.location.pathname;

    if (path.includes('/articles/news/')) {
        prefix = '../../';
    } else if (path.includes('/tools/') || path.includes('/articles/') || path.includes('/Sports/') || path.includes('/Financial/')) {
        // Covers /tools/, /articles/, /Sports/, /Financial/ and any future subfolders at depth 1
        prefix = '../';
    } else if (path.endsWith('.html') && !path.includes('/')) {
        // Root files like about.html, contact.html
        prefix = './';
    }

    // Attempt fetch with fallback
    const fetchWithFallback = async (filename) => {
        try {
            const res = await fetch(`${prefix}data/${filename}`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn(`Failed to fetch ${filename} with prefix ${prefix}, trying root...`);
        }
        // Fallback: Try absolute path (if hosted) or just fail gracefully
        try {
            // If prefix failed, maybe we are at root and didn't know?
            const res = await fetch(`data/${filename}`);
            if (res.ok) return await res.json();
        } catch (e2) {
            console.error(`Currently unable to load ${filename}`);
            return null;
        }
    };

    try {
        const toolsJson = await fetchWithFallback('tools.json');
        if (toolsJson) searchData.tools = toolsJson;

        const newsJson = await fetchWithFallback('news.json');
        if (newsJson) {
            searchData.news = [
                ...(newsJson.latest_updates || []),
                ...(newsJson.analysis_grid || [])
            ];
            if (newsJson.hero) searchData.news.push(newsJson.hero);
        }
    } catch (e) {
        console.error("Critical error loading search data:", e);
    }
}

function handleSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!query) {
        resultsContainer.innerHTML = '<div class="empty-state">Start typing to search...</div>';
        return;
    }

    const q = query.toLowerCase();

    // Filter Tools
    const matchedTools = searchData.tools.filter(tool =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
    ).slice(0, 5); // Limit 5

    // Filter News
    const matchedNews = searchData.news.filter(item =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.summary && item.summary.toLowerCase().includes(q))
    ).slice(0, 5); // Limit 5

    renderResults(matchedTools, matchedNews, query);
}

function renderResults(tools, news, query) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';

    if (tools.length === 0 && news.length === 0) {
        container.innerHTML = `<div class="empty-state">No results found for "${query}"</div>`;
        return;
    }

    // Tools Section
    if (tools.length > 0) {
        const toolSection = document.createElement('div');
        toolSection.className = 'search-section';
        toolSection.innerHTML = `<h5 class="search-section-title">Tools</h5>`;

        tools.forEach(tool => {
            const el = document.createElement('a');
            el.href = tool.url;
            el.target = "_blank";
            el.className = 'search-result-item tool-result';
            el.innerHTML = `
                <img src="https://img.logo.dev/${tool.logo_domain}?token=pk_Mg3XAPU3QqSkLxHtf5tWww" alt="${tool.name}" class="result-logo">
                <div class="result-info">
                    <div class="result-name">${tool.name}</div>
                    <div class="result-desc">${tool.category} • ${tool.description.substring(0, 60)}...</div>
                </div>
            `;
            toolSection.appendChild(el);
        });
        container.appendChild(toolSection);
    }

    // News Section
    if (news.length > 0) {
        const newsSection = document.createElement('div');
        newsSection.className = 'search-section';
        newsSection.innerHTML = `<h5 class="search-section-title">Articles & Updates</h5>`;

        news.forEach(item => {
            const el = document.createElement('a');
            el.href = item.link || '#';
            el.className = 'search-result-item news-result';
            el.innerHTML = `
                <div class="result-info">
                    <div class="result-name">${item.title}</div>
                    <div class="result-desc">${item.summary ? item.summary.substring(0, 80) + '...' : (item.time || 'News Update')}</div>
                </div>
            `;
            newsSection.appendChild(el);
        });
        container.appendChild(newsSection);
    }
}
