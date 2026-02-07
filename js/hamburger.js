
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
});
