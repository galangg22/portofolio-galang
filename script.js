document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const container = document.querySelector('.container');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        if (nav.classList.contains('active')) {
            container.style.marginLeft = '200px';
        } else {
            container.style.marginLeft = '0';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && e.target !== menuToggle) {
            nav.classList.remove('active');
            container.style.marginLeft = '0';
        }
    });

    // Highlight current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.style.backgroundColor = '#ff4d5a';
        }
    });
});

// Prevent zoom on double tap
document.addEventListener('dblclick', function(e) {
    e.preventDefault();
}, { passive: false });

// Prevent zoom on pinch
document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

