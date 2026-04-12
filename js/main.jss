document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => { loadingScreen.style.opacity = '0'; setTimeout(() => { loadingScreen.style.display = 'none'; }, 600); }, 800);

    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`; });
    function animateRing() { ringX += (mouseX - ringX) * 0.2; ringY += (mouseY - ringY) * 0.2; cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`; requestAnimationFrame(animateRing); }
    animateRing();
    const interactiveEls = document.querySelectorAll('a, button, .swatch, .copy-btn, .nav-dot, .btn-calendar, .btn-venue, .radio-pill');
    interactiveEls.forEach(el => {
        el.addEventListener('mouseenter', () => { cursorRing.style.width = '48px'; cursorRing.style.borderColor = 'var(--rose)'; });
        el.addEventListener('mouseleave', () => { cursorRing.style.width = '32px'; cursorRing.style.borderColor = 'var(--sage)'; });
    });

    const scenes = document.querySelectorAll('.scene');
    const navDots = document.querySelectorAll('.nav-dot');
    function updateActiveDot() {
        let scrollPos = window.scrollY + window.innerHeight / 2;
        let activeIndex = 0;
        scenes.forEach((scene, idx) => {
            const offsetTop = scene.offsetTop, offsetBottom = offsetTop + scene.offsetHeight;
            if (scrollPos >= offsetTop && scrollPos < offsetBottom) activeIndex = idx;
        });
        navDots.forEach((dot, i) => { if (i === activeIndex) dot.classList.add('active'); else dot.classList.remove('active'); });
    }
    window.addEventListener('scroll', updateActiveDot);
    updateActiveDot();
    navDots.forEach((dot, idx) => { dot.addEventListener('click', () => { scenes[idx].scrollIntoView({ behavior: 'smooth' }); }); });

    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        const greetingDiv = document.getElementById('guest-greeting');
        greetingDiv.innerHTML = `🌸 Selamat datang, ${decodeURIComponent(guestName)}! 🌸`;
        greetingDiv.classList.remove('hidden');
        setTimeout(() => greetingDiv.classList.add('hidden'), 5000);
    }

    const petalsContainer = document.getElementById('petals-container');
    for (let i = 0; i < 40; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = 6 + Math.random() * 6 + 's';
        petal.style.animationDelay = Math.random() * 10 + 's';
        petal.style.width = 8 + Math.random() * 12 + 'px';
        petalsContainer.appendChild(petal);
    }
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        document.querySelectorAll('.petal').forEach(petal => { petal.style.transform = `translateY(${scrollY * 0.2}px)`; });
    });

    // Dress code swatch interactive
    const swatches = document.querySelectorAll('.swatch');
    swatches.forEach(swatch => {
        swatch.addEventListener('mouseenter', (e) => {
            const tooltipText = swatch.getAttribute('data-tooltip');
            if (!tooltipText) return;
            let tooltip = document.createElement('div');
            tooltip.className = 'swatch-tooltip';
            tooltip.innerText = tooltipText;
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'var(--ink)';
            tooltip.style.color = 'var(--cream)';
            tooltip.style.padding = '4px 10px';
            tooltip.style.borderRadius = '20px';
            tooltip.style.fontSize = '0.7rem';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            document.body.appendChild(tooltip);
            const rect = swatch.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width/2 - tooltip.offsetWidth/2 + 'px';
            tooltip.style.top = rect.top - 30 + 'px';
            swatch._tooltip = tooltip;
        });
        swatch.addEventListener('mouseleave', () => { if (swatch._tooltip) { swatch._tooltip.remove(); swatch._tooltip = null; } });
        swatch.addEventListener('click', () => { swatches.forEach(s => s.classList.remove('selected')); swatch.classList.add('selected'); });
    });
});

// Di dalam DOMContentLoaded, setelah admin mode diaktifkan, tambahkan tombol export
// Cari elemen footer atau buat tombol di bagian bawah
function addExportButton() {
    let exportBtn = document.getElementById('admin-export-btn');
    if (!exportBtn && adminModeEnabled) { // kita perlu variabel global adminMode
        const footer = document.querySelector('.gift-closing-scene .container');
        if (footer) {
            const btn = document.createElement('button');
            btn.id = 'admin-export-btn';
            btn.textContent = 'Ekspor Data Tamu';
            btn.style.margin = '20px auto';
            btn.style.display = 'block';
            btn.style.background = 'var(--gold)';
            btn.style.border = 'none';
            btn.style.padding = '8px 20px';
            btn.style.borderRadius = '40px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                if (window.exportRSVPData) window.exportRSVPData();
            });
            footer.appendChild(btn);
        }
    } else if (exportBtn && !adminModeEnabled) {
        exportBtn.remove();
    }
}

// Di dalam setupAdminTrigger, panggil addExportButton setiap kali adminMode berubah
// Kita perlu sinkronisasi adminMode dari guestbook.js? Sebaiknya buat variabel global.
window.adminMode = false;
// Ubah di guestbook.js: ketika adminMode berubah, set window.adminMode = adminMode; lalu panggil addExportButton

window.toggleExportButton = function(show) {
    let btn = document.getElementById('admin-export-btn');
    if (show && !btn) {
        const footer = document.querySelector('.gift-closing-scene .container');
        if (footer) {
            const newBtn = document.createElement('button');
            newBtn.id = 'admin-export-btn';
            newBtn.textContent = 'Ekspor Data Tamu';
            newBtn.style.margin = '20px auto';
            newBtn.style.display = 'block';
            newBtn.style.background = 'var(--gold)';
            newBtn.style.border = 'none';
            newBtn.style.padding = '8px 20px';
            newBtn.style.borderRadius = '40px';
            newBtn.style.cursor = 'pointer';
            newBtn.addEventListener('click', () => {
                if (window.exportRSVPData) window.exportRSVPData();
            });
            footer.appendChild(newBtn);
        }
    } else if (!show && btn) {
        btn.remove();
    }
};
