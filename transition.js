// Kode Transisi Halaman: Fade-in/Fade-out
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('nav a');

    // Saat tautan diklik
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.href;

            // Tambahkan animasi fade-out dengan scale-down
            document.body.classList.add('fade-out');

            setTimeout(() => {
                window.location.href = target; // Pergi ke halaman target setelah fade-out
            }, 300); // Sesuaikan durasi animasi fade-out dengan durasi CSS
        });
    });

    // Saat halaman dimuat kembali (back/forward navigation)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Jika navigasi berasal dari cache, animasi fade-in dilakukan
            document.body.classList.add('fade-in');
        }
    });

    // Tambahkan kelas fade-in saat halaman pertama kali dimuat
    document.body.classList.add('fade-in');
});
