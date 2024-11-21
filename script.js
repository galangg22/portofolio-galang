// Kode Menu Toggle dan Interaksi Kontainer
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const container = document.querySelector('.container');

    // Toggle menu dan geser kontainer
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Tambahkan delay sebelum menggeser kontainer
        setTimeout(() => {
            container.classList.toggle('shifted');
        }, 300); // Sesuaikan dengan durasi animasi fade-out
    });

    // Tutup menu ketika mengklik di luar menu
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && e.target !== menuToggle) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            container.classList.remove('shifted');
        }
    });

    // Sorot halaman aktif di navigasi
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active-link');
        }
    });
});
