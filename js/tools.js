document.addEventListener('DOMContentLoaded', () => {
    fetchTools();
    initBackToTop();
});

function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

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

let allTools = []; // Store for filtering

async function fetchTools() {
    try {
        const response = await fetch('../data/tools.json');
        if (!response.ok) throw new Error('Failed to load tools data');

        allTools = await response.json();

        // Initial Render: Categorized Grids
        renderCategorizedGrids(allTools);
        renderFeatured(allTools); // Sidebar
        initializeFilters();
    } catch (error) {
        console.error('Error fetching tools:', error);
    }
}

function renderFeatured(tools) {
    const container = document.getElementById('featured-tools-list');
    if (!container) return;

    // Get top 5 trending
    const trending = tools.filter(t => t.is_trending).slice(0, 5);

    container.innerHTML = '';

    trending.forEach(tool => {
        const div = document.createElement('div');
        div.className = 'featured-tool-mini';
        div.innerHTML = `
            <img src="https://img.logo.dev/${tool.logo_domain}?token=pk_Mg3XAPU3QqSkLxHtf5tWww" alt="${tool.name}">
            <h4><a href="redirect.html?url=${encodeURIComponent(tool.url)}&name=${encodeURIComponent(tool.name)}" target="_blank">${tool.name}</a></h4>
        `;
        container.appendChild(div);
    });
}

function renderCategorizedGrids(tools) {
    const mainContainer = document.getElementById('tools-container'); // Renamed container
    if (!mainContainer) return;

    mainContainer.innerHTML = ''; // Clear

    // Group by category
    const categories = {};
    tools.forEach(tool => {
        if (!categories[tool.category]) {
            categories[tool.category] = {
                display: tool.category, // You might map this to full names if needed
                items: []
            };
        }
        categories[tool.category].items.push(tool);
    });

    // Custom Order
    const order = [
        'LLM',
        'Hybrid LLM',
        'Study Research', // New Study Section Start
        'Study Writing',
        'Study Notes',
        'Study Tutor',
        'Study Productivity',
        'Study Presentations',
        'Image Gen',
        'Video Gen',
        'Video Edit',
        'Video Clip',
        'Writing',
        'Marketing',
        'Coding',
        'Automaton',
        'Automation',
        'No-Code',
        'UI Design',
        'Design',
        'Image Edit',
        'Search',
        'Voice',
        'Audio',
        'Conversational',
        'Chatbot',
        'Support',
        'Data',
        'Finance',
        'Productivity',
        'E-commerce',
        'Translation',
        'Research',
        'Meetings',
        'Podcast',
        'Content',
        'Content Opt',
        'HR',
        'Security',
        'ML',
        'ML Platform'
    ];

    order.forEach(catKey => {
        if (categories[catKey]) {
            const group = categories[catKey];

            // Section Wrapper
            const section = document.createElement('div');
            section.className = 'tool-section';

            // Header (mapping short code to display if available in first item, else code)
            const displayTitle = group.items[0].category_display ? group.items[0].category_display.split('/')[0].trim() : catKey;

            section.innerHTML = `
                <div class="category-header">
                    <h2 class="category-title">${displayTitle}</h2>
                </div>
                <div class="news-grid-3">
                    ${group.items.map(tool => createToolCard(tool)).join('')}
                </div>
            `;

            mainContainer.appendChild(section);
        }
    });
}

function renderSingleGrid(tools) {
    const mainContainer = document.getElementById('tools-container');
    if (!mainContainer) return;

    mainContainer.innerHTML = '<div class="news-grid-3">' + tools.map(tool => createToolCard(tool)).join('') + '</div>';
}

function createToolCard(tool) {
    // Reusing the card HTML logic
    // Handle optional badge logic inside HTML if needed

    return `
    <article class="news-card tool-card">
        <div class="tool-header">
            <img src="https://img.logo.dev/${tool.logo_domain}?token=pk_Mg3XAPU3QqSkLxHtf5tWww" alt="${tool.name} Logo" class="tool-logo">
            <h3><a href="redirect.html?url=${encodeURIComponent(tool.url)}&name=${encodeURIComponent(tool.name)}" target="_blank">${tool.name}</a></h3>
        </div>
        <span class="category">${tool.category_display}</span>
        <p>${tool.description}</p>
    </article>
    `;
}

function initializeFilters() {
    const filters = document.querySelectorAll('.filter-btn');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Toggle
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterType = btn.getAttribute('data-filter');

            if (filterType === 'all') {
                renderCategorizedGrids(allTools);
            } else if (filterType === 'trending') {
                const filtered = allTools.filter(t => t.is_trending);
                renderSingleGrid(filtered);
            } else if (filterType === 'new') {
                const filtered = allTools.filter(t => t.is_new);
                renderSingleGrid(filtered);
            } else {
                // Category Filter (e.g. LLM, Image)
                // When clicking a specific category filter, we can show just that category's tools
                // Or render a single grid of them.
                const filtered = allTools.filter(t => t.category === filterType);
                renderSingleGrid(filtered);
            }
        });
    });
}
