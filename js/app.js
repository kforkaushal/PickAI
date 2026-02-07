// Start fetching immediately (Optimistic UI)
const newsDataPromise = fetchNewsData();

document.addEventListener('DOMContentLoaded', async () => {
    // Pass the promise to the initialization logic
    await initApp(newsDataPromise);
    initBackToTop();
    initShareSection();
});

function initShareSection() {
    const articleBody = document.querySelector('.article-body');
    if (!articleBody) return;

    // Avoid duplicate sections
    if (document.querySelector('.share-section')) return;

    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    const shareEl = document.createElement('div');
    shareEl.className = 'share-section';
    shareEl.innerHTML = `
        <span class="share-label">Share Intelligence</span>
        <div class="share-buttons">
            <a href="https://twitter.com/intent/tweet?url=${url}&text=${title}" class="share-btn" title="Share on X" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" class="share-btn" title="Share on LinkedIn" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" class="share-btn" title="Share on Facebook" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://wa.me/?text=${title}%20${url}" class="share-btn" title="Share on WhatsApp" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
            <button class="share-btn copy-link-btn" title="Copy Link">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.293 6.293a1 1 0 0 1 1.414 1.414L12.414 10H15a1 1 0 1 1 0 2h-2.586l2.293 2.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/></svg>
            </button>
        </div>
    `;

    articleBody.appendChild(shareEl);

    // Copy Link functionality
    const copyBtn = shareEl.querySelector('.copy-link-btn');
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard');
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    });
}

function showToast(message) {
    let toast = document.querySelector('.copy-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'copy-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2500);
}

async function fetchNewsData() {
    try {
        let prefix = './';
        if (window.location.pathname.includes('/articles/news/')) {
            prefix = '../../';
        } else if (window.location.pathname.includes('/tools/')) {
            prefix = '../';
        }
        const response = await fetch(`${prefix}data/news.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching news data:', error);
        return null;
    }
}

async function initApp(dataPromise) {
    const data = await dataPromise;
    if (!data) return;

    // 1. Populate Hero Section (Slideshow)
    if (data.hero_slides && data.hero_slides.length > 0) {
        initHeroSlideshow(data.hero_slides);
    } else if (data.hero) {
        populateHero(data.hero);
    }

    populateLatestUpdates(data.latest_updates);
    populateAnalysisGrid(data.analysis_grid);
    populateOpinionGrid(data.opinion_grid);
    populateExplainersGrid(data.explainers_grid);
    populateResearchPapers(data.research_papers);
}

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
            <article class="hero-news" style="align-items:center; padding:0;">
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
            <a href="${slide.link}" class="slide-upper">
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

    // Pagination State
    const itemsPerPage = 4;
    let currentPage = 1;
    const totalPages = Math.ceil(updates.length / itemsPerPage);

    function render() {
        listContainer.innerHTML = ''; // Clear current

        // Validate page
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = updates.slice(start, end);

        // Render Items
        pageItems.forEach(item => {
            const updateDiv = document.createElement('div');
            updateDiv.className = 'update-item';
            updateDiv.innerHTML = `
            <span class="time">${item.time}</span>
            <h4><a href="${item.link}">${item.title}</a></h4>
        `;
            listContainer.appendChild(updateDiv);
        });

        // Render Pagination Controls
        if (totalPages > 1) {
            const controls = document.createElement('div');
            controls.className = 'pagination-controls';

            // Prev Button
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '&laquo; Prev';
            prevBtn.className = 'pagination-btn';
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => {
                if (currentPage > 1) {
                    currentPage--;
                    render();
                }
            };

            // Page Indicator
            const indicator = document.createElement('span');
            indicator.className = 'pagination-info';
            indicator.textContent = `${currentPage} / ${totalPages}`;

            // Next Button
            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = 'Next &raquo;';
            nextBtn.className = 'pagination-btn';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    render();
                }
            };

            controls.appendChild(prevBtn);
            controls.appendChild(indicator);
            controls.appendChild(nextBtn);
            listContainer.appendChild(controls);
        }
    }

    render();
}

function populateAnalysisGrid(gridItems) {
    const gridContainer = document.getElementById('secondary-grid');
    if (!gridContainer || !gridItems) return;

    // Pagination Settings
    const itemsPerPage = 12;
    let currentPage = 1;
    const totalPages = Math.ceil(gridItems.length / itemsPerPage);

    // Create a container for pagination controls right after the grid
    // We need to check if one exists or create it.
    // Ideally, we append it to the parent section of the grid.
    let paginationContainer = document.getElementById('analysis-pagination');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'analysis-pagination';
        paginationContainer.className = 'pagination-controls';
        paginationContainer.style.marginTop = '40px';
        paginationContainer.style.display = 'flex';
        paginationContainer.style.justifyContent = 'center';
        paginationContainer.style.gap = '20px';
        // Insert after the grid
        gridContainer.parentNode.insertBefore(paginationContainer, gridContainer.nextSibling);
    }

    function render() {
        gridContainer.innerHTML = ''; // Clear current items

        // Validate page
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = gridItems.slice(start, end);

        pageItems.forEach(item => {
            const article = document.createElement('article');

            // check if image exists for rich card layout
            if (item.image_url) {
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
            } else {
                // Fallback to text only
                article.className = 'news-card';
                article.innerHTML = `
                <span class="category">${item.category}</span>
                <h3><a href="${item.link}">${item.title}</a></h3>
                <p>${item.summary}</p>
            `;
            }

            gridContainer.appendChild(article);
        });

        updatePaginationControls();
    }

    function updatePaginationControls() {
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return; // No controls needed if 1 page

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '&laquo; Previous';
        prevBtn.className = 'pagination-btn';
        prevBtn.disabled = currentPage === 1;
        if (currentPage === 1) prevBtn.style.opacity = '0.5';
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                render();
                // Scroll to top of section
                gridContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        // Info Text
        const indicator = document.createElement('span');
        indicator.className = 'pagination-info';
        indicator.textContent = `Page ${currentPage} of ${totalPages}`;
        indicator.style.display = 'flex';
        indicator.style.alignItems = 'center';
        indicator.style.fontWeight = '500';

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = 'Next &raquo;';
        nextBtn.className = 'pagination-btn';
        nextBtn.disabled = currentPage === totalPages;
        if (currentPage === totalPages) nextBtn.style.opacity = '0.5';
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                render();
                gridContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(indicator);
        paginationContainer.appendChild(nextBtn);
    }

    render();
}
