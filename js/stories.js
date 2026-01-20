document.addEventListener('DOMContentLoaded', async () => {
    // Only init if stories container exists
    if (!document.getElementById('stories-container')) return;

    let stories = [];
    let currentSlide = 0;
    let autoAdvanceTimer = null;
    let isPaused = false;
    const SLIDE_DURATION = 5000;

    // DOM Elements
    conststoriesContainer = document.getElementById('stories-container');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenSlides = document.getElementById('fullscreen-slides');
    const fullscreenProgress = document.getElementById('fullscreen-progress');
    const storiesContainerEl = document.getElementById('stories-container');

    // Init Logic
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) throw new Error('Failed to fetch news');
        const news = await response.json();

        // Build stories (same logic as webslide)
        const heroLinks = new Set(news.hero_slides.map(item => item.link));
        stories = [
            ...news.hero_slides.map(item => ({
                title: item.title,
                description: item.summary,
                image: item.image_url,
                link: item.link,
                category: item.date || 'Featured'
            })),
            ...news.analysis_grid
                .filter(item => !heroLinks.has(item.link))
                .slice(0, 4)
                .map(item => ({
                    title: item.title,
                    description: item.summary,
                    image: item.image_url || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/1200`,
                    link: item.link,
                    category: item.category || 'Analysis'
                }))
        ];

        renderStoryCards(stories);
        setupFullscreen();

    } catch (e) {
        console.error('Error initializing stories:', e);
    }

    function renderStoryCards(stories) {
        if (!storiesContainerEl) return;
        storiesContainerEl.innerHTML = stories.map((story, i) => `
            <div class="story-card" data-index="${i}">
                <img src="${story.image}" alt="${story.title}" loading="lazy">
                <div class="overlay"></div>
                <div class="content">
                    <span class="category">${story.category}</span>
                    <h3>${story.title}</h3>
                </div>
                <svg class="progress-ring" viewBox="0 0 32 32">
                    <circle class="bg" cx="16" cy="16" r="14"/>
                    <circle class="progress" cx="16" cy="16" r="14"/>
                </svg>
            </div>
        `).join('');
    }

    function setupFullscreen() {
        if (!fullscreenModal || !fullscreenSlides || !fullscreenProgress) return;

        // Build fullscreen slides
        fullscreenProgress.innerHTML = stories.map((_, i) => `
            <div class="bar ${i === 0 ? 'active' : ''}" data-index="${i}">
                <div class="fill"></div>
            </div>
        `).join('');

        const slidesHTML = stories.map((story, i) => `
            <div class="fullscreen-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                <img src="${story.image}" alt="${story.title}">
                <div class="overlay"></div>
                <div class="content">
                    <span class="category">${story.category}</span>
                    <h2>${story.title}</h2>
                    <p>${story.description}</p>
                    <a href="${story.link}" class="cta">Read Full Story</a>
                </div>
            </div>
        `).join('');

        fullscreenSlides.insertAdjacentHTML('afterbegin', slidesHTML);

        // Events
        document.querySelectorAll('.story-card').forEach(card => {
            card.addEventListener('click', () => {
                currentSlide = parseInt(card.dataset.index);
                openFullscreen();
            });
        });

        const openBtn = document.getElementById('open-fullscreen');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                currentSlide = 0;
                openFullscreen();
            });
        }

        const closeBtn = document.getElementById('close-fullscreen');
        if (closeBtn) closeBtn.addEventListener('click', closeFullscreen);

        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

        const prevBtn = document.getElementById('nav-prev');
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        const nextBtn = document.getElementById('nav-next');
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!fullscreenModal.classList.contains('active')) return;
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            else if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'Escape') closeFullscreen();
        });
    }

    function openFullscreen() {
        fullscreenModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        goToSlide(currentSlide);
        startAutoAdvance();
    }

    function closeFullscreen() {
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = '';
        stopAutoAdvance();
    }

    function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= stories.length) {
            closeFullscreen();
            return;
        }

        currentSlide = index;

        document.querySelectorAll('.fullscreen-slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        document.querySelectorAll('.fullscreen-progress .bar').forEach((bar, i) => {
            bar.classList.remove('active', 'completed');
            if (i < index) bar.classList.add('completed');
            else if (i === index) bar.classList.add('active');
        });

        if (!isPaused) startAutoAdvance();
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    function startAutoAdvance() {
        stopAutoAdvance();
        if (!isPaused) {
            autoAdvanceTimer = setTimeout(nextSlide, SLIDE_DURATION);
        }
    }

    function stopAutoAdvance() {
        if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    }

    function togglePause() {
        isPaused = !isPaused;
        const btn = document.getElementById('pause-btn');
        if (btn) btn.textContent = isPaused ? '>' : 'II';

        if (isPaused) {
            stopAutoAdvance();
            document.querySelectorAll('.fullscreen-progress .bar.active .fill').forEach(f => {
                f.style.animationPlayState = 'paused';
            });
        } else {
            document.querySelectorAll('.fullscreen-progress .bar.active .fill').forEach(f => {
                f.style.animationPlayState = 'running';
            });
            startAutoAdvance();
        }
    }
});
