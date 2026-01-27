
document.addEventListener('DOMContentLoaded', async () => {
    const accordionWrapper = document.getElementById('category-accordion');
    if (!accordionWrapper) return;

    try {
        const response = await fetch('data/news.json');
        if (!response.ok) throw new Error('Failed to load news data');

        const data = await response.json();
        populateAccordion(data);
    } catch (error) {
        console.error('Error loading accordion data:', error);
        document.querySelectorAll('.category-list').forEach(list => {
            list.innerHTML = '<li>Unable to load content.</li>';
        });
    }
});

function populateAccordion(data) {
    // Define Mappings
    const categories = {
        models: [],
        policy: [],
        industry: [],
        guides: []
    };

    // 1. Models & Architecture
    // Include Research Papers, DeepSeek updates, Model launches
    if (data.research_papers) {
        categories.models.push(...data.research_papers.map(item => ({
            title: item.title,
            link: item.link,
            meta: item.date || 'Research'
        })));
    }
    if (data.analysis_grid) {
        const modelItems = data.analysis_grid.filter(item =>
            ['Product Launch', 'Research'].includes(item.category)
        );
        categories.models.push(...modelItems.map(item => ({
            title: item.title,
            link: item.link,
            meta: item.category
        })));
    }

    // 2. Policy, Ethics & Safety
    if (data.opinion_grid) {
        const policyItems = data.opinion_grid.filter(item =>
            ['Policy', 'Ethics', 'Philosophy', 'Alignment'].includes(item.category)
        );
        categories.policy.push(...policyItems.map(item => ({
            title: item.title,
            link: item.link,
            meta: item.category
        })));
    }

    // 3. Industry & Enterprise
    if (data.analysis_grid) {
        const industryItems = data.analysis_grid.filter(item =>
            ['Industry', 'Funding', 'Market', 'Economic Analysis', 'Trend Analysis'].includes(item.category)
        );
        categories.industry.push(...industryItems.map(item => ({
            title: item.title,
            link: item.link,
            meta: item.category
        })));
    }
    if (data.opinion_grid) {
        const marketItems = data.opinion_grid.filter(item => item.category === 'Market');
        categories.industry.push(...marketItems.map(item => ({
            title: item.title,
            link: item.link,
            meta: 'Opinion'
        })));
    }

    // 4. Guides & Explainers
    if (data.explainers_grid) {
        categories.guides.push(...data.explainers_grid.map(item => ({
            title: item.title,
            link: item.link,
            meta: item.category || 'Explainer'
        })));
    }
    if (data.analysis_grid) {
        const guideItems = data.analysis_grid.filter(item =>
            ['Guide', 'Reviews'].includes(item.category)
        );
        categories.guides.push(...guideItems.map(item => ({
            title: item.title,
            link: item.link,
            meta: item.category
        })));
    }

    // 5. A to Z Index (All unique articles sorted)
    const allArticles = [
        ...categories.models,
        ...categories.policy,
        ...categories.industry,
        ...categories.guides
    ];

    // De-duplicate by link
    const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.link, item])).values());

    // Sort Alphabetically
    categories.atoz = uniqueArticles.sort((a, b) => a.title.localeCompare(b.title));

    // Render Lists
    renderList('models', categories.models);
    renderList('policy', categories.policy);
    renderList('industry', categories.industry);
    renderList('guides', categories.guides);
    renderList('atoz', categories.atoz, true); // Pass true to allow longer list
}

function renderList(categoryId, items, isLongList = false) {
    const listElement = document.querySelector(`.category-list[data-category="${categoryId}"]`);
    if (!listElement) return;

    if (items.length === 0) {
        listElement.innerHTML = '<li>No articles found.</li>';
        return;
    }

    // Limit to 6 items per category unless it's the A-Z list or explicitly long
    const displayItems = isLongList ? items : items.slice(0, 6);

    listElement.innerHTML = displayItems.map(item => `
        <li>
            <a href="${item.link}">${item.title}</a>
            <span class="meta">${item.meta}</span>
        </li>
    `).join('');
}
