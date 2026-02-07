
document.addEventListener('DOMContentLoaded', () => {
    console.log('Hamburger script loaded');

    function toggleSidebar(open) {
        const sidebar = document.querySelector('.sidebar-menu');
        const overlay = document.querySelector('.sidebar-overlay');
        const menuToggle = document.querySelector('.menu-toggle');

        console.log('Toggle Sidebar:', open, sidebar, overlay);

        if (sidebar && overlay) {
            if (open) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }
        } else {
            console.error('Sidebar elements not found');
        }
    }

    // Use Event Delegation for robustness
    document.body.addEventListener('click', (e) => {
        // Open
        if (e.target.closest('.menu-toggle')) {
            e.stopPropagation();
            toggleSidebar(true);
        }
        // Close (Button or Overlay)
        if (e.target.closest('.close-sidebar') || e.target.classList.contains('sidebar-overlay')) {
            toggleSidebar(false);
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleSidebar(false);
        }
    });
    // --- Weather Widget Logic ---
    const MAPPING = {
        0: 'Clear', 1: 'Clear', 2: 'Cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
        61: 'Rain', 63: 'Rain', 65: 'Rain', 71: 'Snow', 73: 'Snow', 75: 'Snow',
        95: 'Storm'
    };

    async function initSidebarWeather() {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) return;

        // Check Cache (30 Min)
        const cached = localStorage.getItem('sidebar_weather');
        if (cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.ts < 1800000) {
                renderWidget(data.weather, data.loc);
                return;
            }
        }

        // Try Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    fetchAndCache(latitude, longitude);
                },
                () => fetchAndCache(19.076, 72.877, "Mumbai, India") // Mumbai Fallback
            );
        } else {
            fetchAndCache(19.076, 72.877, "Mumbai, India");
        }
    }

    async function fetchAndCache(lat, lon, knownName = null) {
        try {
            // Reverse Geocode name if not known
            let locName = knownName || "Your Location";
            if (!knownName) {
                // Limit API calls by only reverse geocoding if we don't have a cached version
                const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
                const gData = await geo.json();
                if (gData.address) locName = gData.address.city || gData.address.town || "Your Location";
            }

            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
            const weather = await res.json();

            const payload = { weather, loc: locName, ts: Date.now() };
            localStorage.setItem('sidebar_weather', JSON.stringify(payload));
            renderWidget(weather, locName);
        } catch (e) {
            console.error("Weather Widget Error:", e);
        }
    }

    function renderWidget(data, loc) {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) return;

        let widget = document.querySelector('.sidebar-weather');
        if (!widget) {
            widget = document.createElement('div');
            widget.className = 'sidebar-weather';
            sidebarContent.appendChild(widget);
        }

        const temp = Math.round(data.current.temperature_2m);
        const desc = MAPPING[data.current.weather_code] || 'Clear';

        widget.innerHTML = `
            <div class="weather-widget-mini">
                <div class="weather-widget-info">
                    <div class="weather-widget-city">${loc}</div>
                    <div class="weather-widget-desc">${desc}</div>
                    <div class="weather-widget-status">
                        <span class="status-dot"></span> Live Data
                    </div>
                </div>
                <div class="weather-widget-temp">${temp}°C</div>
            </div>
        `;
    }

    function initSidebarDate() {
        const sidebarContent = document.querySelector('.sidebar-content');
        const searchSection = document.querySelector('.sidebar-search');
        if (!sidebarContent || !searchSection) return;

        let dateEl = document.querySelector('.sidebar-date');
        if (!dateEl) {
            dateEl = document.createElement('div');
            dateEl.className = 'sidebar-date';
            dateEl.id = 'sidebar-date-display';
            sidebarContent.insertBefore(dateEl, searchSection);
        }

        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);

        dateEl.innerHTML = `
            <div class="sidebar-date-label">Today's Edition</div>
            <div class="sidebar-date-value">${dateStr}</div>
        `;
    }

    initSidebarWeather();
    initSidebarDate();
});

