document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('nav a');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.href;
            
            document.body.classList.add('fade-out');
            
            setTimeout(() => {
                window.location.href = target;
            }, 300);
        });
    });
    
    window.addEventListener('pageshow', () => {
        document.body.classList.remove('fade-out');
    });
});

