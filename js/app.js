document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch('data/news.json');
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

    } catch (error) {
        console.error('Error fetching news data:', error);
    }
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
            <div class="slide-upper">
                <img src="${slide.image_url}" class="slide-bg-image" alt="${slide.title}">
                <div class="slide-badge">${slide.date || "Today's Briefing"}</div>
                <div class="slide-overlay">
                    <h2 class="slide-title-overlay">${slide.title}</h2>
                </div>
            </div>
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
        <h4><a href="${item.link}">${item.title}</a></h4>
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
            <a href="${item.link}" class="card-image-container" style="display:block;">
                <img src="${item.image_url}" alt="${item.title}" class="card-bg-image">
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
}
