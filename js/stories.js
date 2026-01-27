document.addEventListener('DOMContentLoaded', async () => {
    // Only init if stories container exists
    if (!document.getElementById('stories-container')) return;

    let stories = [];
    let currentSlide = 0;
    let autoAdvanceTimer = null;
    let isPaused = false;
    // Auto-Scroll Variables
    let scrollInterval = null;
    let scrollSpeed = 0.8; // Pixels per frame
    let isScrolling = true;

    // DOM Elements - Fixed naming
    const storiesContainerEl = document.getElementById('stories-container');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenSlides = document.getElementById('fullscreen-slides');
    const fullscreenProgress = document.getElementById('fullscreen-progress');

    // Init Logic
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) throw new Error('Failed to fetch news');
        const news = await response.json();

        // Build stories
        const heroLinks = new Set(news.hero_slides.map(item => item.link));
        const originalStories = [
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

        // DUPLICATE CONTENT FOR INFINITE SCROLL
        // We create a "display list" that is just double the original
        stories = originalStories; // Keep original reference for fullscreen logic (no duplicates needed in modal)

        // Render Duplicated List for Grid
        renderStoryCards([...originalStories, ...originalStories]);
        setupFullscreen();
        startInfiniteScroll();

    } catch (e) {
        console.error('Error initializing stories:', e);
    }

    function renderStoryCards(displayStories) {
        if (!storiesContainerEl) return;
        storiesContainerEl.innerHTML = displayStories.map((story, i) => `
            <div class="story-card" data-index="${i % stories.length}" style="display: inline-block; white-space: normal;"> <!-- Inline block for nowrap container -->
                <img src="${story.image}" alt="${story.title}" loading="lazy">
                <div class="overlay"></div>
                <div class="content">
                    <span class="category">${story.category}</span>
                    <h3>${story.title}</h3>
                </div>
            </div>
        `).join('');
    }

    function startInfiniteScroll() {
        let animationFrameId;

        function scroll() {
            if (isScrolling && !fullscreenModal.classList.contains('active')) {
                storiesContainerEl.scrollLeft += scrollSpeed;

                // Infinite Scroll Logic
                // If we have scrolled past half the width (the first set of items), reset to 0
                // We use scrollWidth / 2 because we duplicated the content exactly once
                if (storiesContainerEl.scrollLeft >= (storiesContainerEl.scrollWidth / 2)) {
                    storiesContainerEl.scrollLeft = 0;
                    // Adjust for any small fractional overshot causing a "jump"?
                    // Usually resetting to 0 is fine if widths are exact.
                    // For more precision: storiesContainerEl.scrollLeft -= (storiesContainerEl.scrollWidth / 2);
                    // But 0 is safer vs floating point drift.
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        }

        animationFrameId = requestAnimationFrame(scroll);

        // Hover Events
        storiesContainerEl.addEventListener('mouseenter', () => isScrolling = false);
        storiesContainerEl.addEventListener('mouseleave', () => isScrolling = true);

        // Touch Interaction (Pause while touching)
        storiesContainerEl.addEventListener('touchstart', () => isScrolling = false);
        storiesContainerEl.addEventListener('touchend', () => {
            setTimeout(() => isScrolling = true, 1000); // Resume after delays
        });
    }

    function setupFullscreen() {
        if (!fullscreenModal || !fullscreenSlides || !fullscreenProgress) return;

        // Build fullscreen slides (ORIGINAL LIST only)
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
        // Note: querySelectorAll will pick up duplicates too, which is fine
        document.querySelectorAll('.story-card').forEach(card => {
            card.addEventListener('click', () => {
                currentSlide = parseInt(card.dataset.index);
                openFullscreen();
            });
        });

        const openBtn = document.getElementById('open-fullscreen');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                currentSlide = 0; // Default start
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
        isScrolling = false; // Stop background scroll
        goToSlide(currentSlide);
        // Do NOT auto advance fullscreen unless requested? 
        // Original logic had it.
        isPaused = false;
        startAutoAdvance();
    }

    function closeFullscreen() {
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = '';
        isScrolling = true; // Resume background scroll
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
        // 5 seconds per slide in fullscreen
        if (!isPaused && fullscreenModal.classList.contains('active')) {
            autoAdvanceTimer = setTimeout(nextSlide, 5000);
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
