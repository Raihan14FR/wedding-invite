const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => { const winScroll = document.documentElement.scrollTop; const height = document.documentElement.scrollHeight - window.innerHeight; const scrolled = (winScroll / height) * 100; progressBar.style.width = scrolled + '%'; });
const aosElements = document.querySelectorAll('[data-aos]');
const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('aos-animate'); observer.unobserve(entry.target); } }); }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });
aosElements.forEach(el => observer.observe(el));