document.addEventListener('DOMContentLoaded', () => {
    fetchData();
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

async function fetchData() {
    try {
        // Determine path prefix based on depth
        let prefix = './';
        if (window.location.pathname.includes('/articles/news/')) {
            prefix = '../../';
        } else if (window.location.pathname.includes('/tools/')) {
            prefix = '../';
        }

        // Helper to fix links in JSON data
        const resolvePath = (link) => {
            if (link.startsWith('http') || link.startsWith('#')) return link;
            if (link.startsWith('./')) link = link.substring(2);
            return prefix + link;
        };

        const response = await fetch(`${prefix}data/news.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 1. Populate Hero Section (Slideshow)
        if (data.hero_slides && data.hero_slides.length > 0) {
            initHeroSlideshow(data.hero_slides);
        } else if (data.hero) {
            // Fallback or static hero logic if needed
            populateHero(data.hero);
        }

        populateLatestUpdates(data.latest_updates);
        populateAnalysisGrid(data.analysis_grid);
        populateOpinionGrid(data.opinion_grid);
        populateExplainersGrid(data.explainers_grid);
        populateResearchPapers(data.research_papers);

    } catch (error) {
        console.error('Error fetching news data:', error);
    }
}

function populateResearchPapers(papers) {
    const listContainer = document.getElementById('research-paper-list');
    if (!listContainer || !papers) return;

    listContainer.innerHTML = ''; // Clear loading state

    papers.forEach(paper => {
        const entry = document.createElement('article');
        // Use standard 'analysis-card' which has the border and hover effect
        entry.className = 'analysis-card';
        entry.style.display = 'flex';
        entry.style.flexDirection = 'column';
        entry.style.height = '100%'; // Full height for grid alignment

        // Use the first tag as the main category, others as small badges in meta
        const mainCategory = paper.tags[0] || 'Research';

        entry.innerHTML = `
            <span class="category">${mainCategory}</span>
            <h2 style="font-size:1.5rem; margin-bottom:var(--space-md);"><a href="${paper.link}">${paper.title}</a></h2>
            
            <p style="font-size:1rem; line-height:1.6; color:var(--color-text-secondary); flex-grow:1; margin-bottom:var(--space-lg);">
                ${paper.abstract}
            </p>

            <div class="border-t" style="padding-top:var(--space-md); margin-top:auto;">
                <div class="meta-text" style="margin-bottom:4px; font-weight:500; color:var(--color-text-primary);">${paper.authors}</div>
                <div class="meta-text" style="display:flex; justify-content:space-between;">
                    <span>${paper.date}</span>
                    <a href="${paper.link}" style="text-decoration:underline; color:var(--color-accent);">Read Paper &rarr;</a>
                </div>
            </div>
        `;
        listContainer.appendChild(entry);
    });
}

// --- 4. Opinion & Perspectives ---
function populateOpinionGrid(gridItems) {
    // A. Check for Homepage Grid
    const homeGrid = document.getElementById('opinion-grid');

    // B. Check for Dedicated Page Containers
    const featuredContainer = document.getElementById('opinion-featured');
    // If we are on the opinion page, 'opinion-grid' acts as the "Latest" section (2nd section)

    if (!gridItems) return;

    // SCENARIO 1: Dedicated Opinion Page (Has Featured Section)
    if (featuredContainer) {
        // Featured: First Item
        const featuredItem = gridItems[0];
        featuredContainer.innerHTML = `
            <article class="hero-news" style="grid-template-columns: 1fr 1fr; align-items:center; gap:var(--space-xl); padding:0;">
                <div class="image-container">
                     <img src="${featuredItem.image_url}" style="width:100%; border-radius:4px;" alt="${featuredItem.title}">
                </div>
                <div class="content">
                    <span class="category" style="margin-bottom:10px; display:block;">${featuredItem.category}</span>
                    <h1 style="font-size:2.5rem; margin-bottom:15px;"><a href="${featuredItem.link}">${featuredItem.title}</a></h1>
                    <p class="summary" style="font-size:1.1rem; color:var(--color-text-secondary);">${featuredItem.summary}</p>
                </div>
            </article>
        `;

        // Latest: Rest of items
        const remainingItems = gridItems.slice(1);
        if (homeGrid) {
            homeGrid.innerHTML = '';
            remainingItems.forEach(item => renderOpinionCard(item, homeGrid));
        }
    }
    // SCENARIO 2: Homepage (Just the grid)
    else if (homeGrid) {
        homeGrid.innerHTML = '';
        // Show first 3 items only on homepage to fit
        const previewItems = gridItems.slice(0, 3);
        previewItems.forEach(item => renderOpinionCard(item, homeGrid));
    }
}

function renderOpinionCard(item, container) {
    const article = document.createElement('article');
    article.className = 'news-card-rich';
    article.innerHTML = `
        <a href="${item.link}" class="card-image-container" style="display:block;">
            <img src="${item.image_url}" alt="${item.title}" class="card-bg-image" loading="lazy">
            <div class="card-overlay-gradient">
                <span class="card-overlay-category">${item.category}</span>
                <h3 class="card-overlay-title">${item.title}</h3>
            </div>
        </a>
        <p style="margin-top: 8px; font-size: 0.95rem; color: var(--color-text-secondary);">${item.summary}</p>
    `;
    container.appendChild(article);
}

// --- 5. Explainers & Guides ---
function populateExplainersGrid(gridItems) {
    // Homepage Container
    const homeGrid = document.getElementById('explainers-grid');
    // Dedicated Page Containers
    const coreContainer = document.getElementById('explainers-core');
    const advancedContainer = document.getElementById('explainers-advanced');

    if (!gridItems) return;

    // SCENARIO 1: Dedicated Page
    if (coreContainer && advancedContainer) {
        coreContainer.innerHTML = '';
        advancedContainer.innerHTML = '';

        gridItems.forEach(item => {
            const isCore = ['Concept', 'Architecture'].includes(item.category);
            const targetContainer = isCore ? coreContainer : advancedContainer;
            renderExplainerCard(item, targetContainer);
        });
    }
    // SCENARIO 2: Homepage
    else if (homeGrid) {
        homeGrid.innerHTML = '';
        const previewItems = gridItems.slice(0, 3);
        previewItems.forEach(item => renderExplainerCard(item, homeGrid));
    }
}

function renderExplainerCard(item, container) {
    const article = document.createElement('article');
    article.className = 'news-card';
    article.innerHTML = `
        <span class="category" style="color:var(--color-secondary); border-color:var(--color-secondary);">${item.category}</span>
        <h3><a href="${item.link}">${item.title}</a></h3>
        <p>${item.summary}</p>
    `;
    container.appendChild(article);
}

// Deprecated or Fallback for static hero (only if elements exist)
function populateHero(heroData) {
    const title = document.getElementById('hero-title');
    if (title && heroData) {
        title.textContent = heroData.title;
        // ... populate other static fields if they exist ...
    }
}

// Stats / Logic (Mock)
console.log("PickAI App Initialized");

// --- Hero Slideshow Logic ---
function initHeroSlideshow(slides) {
    const container = document.getElementById('hero-slider');
    if (!container) return;

    // Clear loading state
    container.innerHTML = '';

    // Create Slides Wrapper
    slides.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = `hero-slide ${index === 0 ? 'active' : ''}`;

        // Split Layout: Upper (Image+Title) & Lower (Description)
        slideEl.innerHTML = `
            <a href="${resolvePath(slide.link)}" class="slide-upper">
                <img src="${slide.image_url}" class="slide-bg-image" alt="${slide.title}" loading="${index === 0 ? 'eager' : 'lazy'}">
                <div class="slide-badge">${slide.date || "Today's Briefing"}</div>
                <div class="slide-overlay">
                    <h2 class="slide-title-overlay">${slide.title}</h2>
                </div>
            </a>
            <div class="slide-lower">
                <div class="slide-meta">
                    <span style="color:var(--color-accent);">${slide.author}</span>
                </div>
                <div class="slide-summary">${slide.summary}</div>
            </div>
        `;
        container.appendChild(slideEl);
    });

    // Create Navigation Controls (Arrows)
    const prevBtn = document.createElement('button');
    prevBtn.className = 'slider-nav-btn prev-btn';
    prevBtn.innerHTML = '&#10094;'; // <
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slider-nav-btn next-btn';
    nextBtn.innerHTML = '&#10095;'; // >
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
    });

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);

    // Create Indicators
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'slider-indicators';
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `indicator ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetTimer();
        });
        indicatorsContainer.appendChild(dot);
    });
    container.appendChild(indicatorsContainer);

    // Auto-Rotate Logic
    let currentSlide = 0;
    const totalSlides = slides.length;
    let slideInterval;

    function goToSlide(index) {
        // Wrap around
        if (index >= totalSlides) index = 0;
        if (index < 0) index = totalSlides - 1;

        currentSlide = index;

        // Update DOM classes
        const allSlides = container.querySelectorAll('.hero-slide');
        const allDots = container.querySelectorAll('.indicator');

        allSlides.forEach(el => el.classList.remove('active'));
        allDots.forEach(el => el.classList.remove('active'));

        allSlides[currentSlide].classList.add('active');
        allDots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startTimer() {
        slideInterval = setInterval(nextSlide, 6000); // 6 Seconds
    }

    function resetTimer() {
        clearInterval(slideInterval);
        startTimer();
    }

    // Initialize Timer
    startTimer();

    // Pause on hover (Optional, usually good UX)
    container.addEventListener('mouseenter', () => clearInterval(slideInterval));
    container.addEventListener('mouseleave', startTimer);
}

function populateLatestUpdates(updates) {
    const listContainer = document.getElementById('latest-updates-list');
    if (!listContainer || !updates) return;

    listContainer.innerHTML = ''; // Clear placeholders

    updates.forEach(item => {
        const updateDiv = document.createElement('div');
        updateDiv.className = 'update-item';

        updateDiv.innerHTML = `
        <span class="time">${item.time}</span>
        <span class="time">${item.time}</span>
        <h4><a href="${resolvePath(item.link)}">${item.title}</a></h4>
    `;

        listContainer.appendChild(updateDiv);
    });
}

function populateAnalysisGrid(gridItems) {
    const gridContainer = document.getElementById('secondary-grid');
    if (!gridContainer || !gridItems) return;

    gridContainer.innerHTML = ''; // Clear placeholders

    gridItems.forEach(item => {
        const article = document.createElement('article');

        // check if image exists for rich card layout
        if (item.image_url) {
            article.className = 'news-card-rich'; // New class or just structure change
            article.innerHTML = `
            <a href="${resolvePath(item.link)}" class="card-image-container" style="display:block;">
                <img src="${item.image_url}" alt="${item.title}" class="card-bg-image" loading="lazy">
                <div class="card-overlay-gradient">
                    <span class="card-overlay-category">${item.category}</span>
                    <h3 class="card-overlay-title">${item.title}</h3>
                </div>
            </a>
            <p style="margin-top: 8px; font-size: 0.95rem; color: var(--color-text-secondary);">${item.summary}</p>
        `;
        } else {
            // Fallback to text only
            article.className = 'news-card';
            article.innerHTML = `
            <span class="category">${item.category}</span>
            <h3><a href="${resolvePath(item.link)}">${item.title}</a></h3>
            <p>${item.summary}</p>
        `;
        }

        gridContainer.appendChild(article);
    });
}
