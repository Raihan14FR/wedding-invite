let konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
let ampersandClickCount = 0;
const ampersand = document.querySelector('.easter-trigger');
const modal = document.getElementById('easter-modal');
const closeModal = document.querySelector('.close-modal');
function showEasterEgg() {
    modal.classList.remove('hidden');
    for (let i = 0; i < 150; i++) {
        const conf = document.createElement('div');
        conf.classList.add('confetti');
        conf.style.left = Math.random() * 100 + '%';
        conf.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 65%)`;
        conf.style.animationDuration = 1 + Math.random() * 2 + 's';
        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 2500);
    }
}
closeModal.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
window.addEventListener('keydown', (e) => { if (e.key === konamiSequence[konamiIndex]) { konamiIndex++; if (konamiIndex === konamiSequence.length) { showEasterEgg(); konamiIndex = 0; } } else { konamiIndex = 0; } });
ampersand?.addEventListener('click', () => { ampersandClickCount++; if (ampersandClickCount === 5) { showEasterEgg(); ampersandClickCount = 0; } setTimeout(() => { ampersandClickCount = 0; }, 3000); });