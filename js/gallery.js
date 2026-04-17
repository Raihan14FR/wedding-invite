// gallery.js - Premium Carousel with captions
(function() {
  const track = document.getElementById('galleryTrack');
  const dotsContainer = document.getElementById('galleryDots');
  const captionEl = document.getElementById('galleryCaption');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const zoomHint = document.getElementById('galleryZoomHint');
  
  // Data galeri: path foto dan caption (GANTI dengan foto asli Anda)
  const galleryItems = [
    { 
      src: 'assets/images/gallery/gallery-1.jpg', 
      caption: 'Pertama kali bertemu – Yogyakarta, 2021'
    },
    { 
      src: 'assets/images/gallery/gallery-2.jpg', 
      caption: 'Lamaran – Lampung, 2024'
    },
    { 
      src: 'assets/images/gallery/gallery-3.jpg', 
      caption: 'Pre-wedding di pantai'
    },
    { 
      src: 'assets/images/gallery/gallery-4.jpg', 
      caption: 'Momen bersama keluarga'
    },
    { 
      src: 'assets/images/gallery/gallery-5.jpg', 
      caption: 'Menuju hari bahagia'
    },
    { 
      src: 'assets/images/gallery/gallery-6.jpg', 
      caption: 'Doa restu orang tua'
    },
    { 
      src: 'assets/images/gallery/gallery-7.jpg', 
      caption: 'Sesi foto casual'
    },
    { 
      src: 'assets/images/gallery/gallery-8.jpg', 
      caption: 'Saling menggenggam'
    }
  ];
  
  let currentIndex = 0;
  let slides = [];
  let interval;
  let touchStartX = 0;
  
  function buildGallery() {
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    galleryItems.forEach((item, i) => {
      const slide = document.createElement('div');
      slide.className = 'gallery-slide';
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = `Galeri ${i+1}`;
      img.loading = 'lazy';
      // Fallback jika gambar tidak ada
      img.onerror = function() {
        this.src = 'https://picsum.photos/id/1015/800/600';
      };
      slide.appendChild(img);
      track.appendChild(slide);
      
      // Dot
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Pergi ke slide ${i+1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
    
    slides = document.querySelectorAll('.gallery-slide');
    updateCaption(0);
  }
  
  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update dots
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
    
    // Update caption
    updateCaption(currentIndex);
  }
  
  function updateCaption(index) {
    captionEl.textContent = galleryItems[index].caption;
  }
  
  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide() { goToSlide(currentIndex - 1); }
  
  function startAutoSlide() {
    if (interval) clearInterval(interval);
    interval = setInterval(nextSlide, 4000);
  }
  function stopAutoSlide() { clearInterval(interval); }
  
  // Event listeners
  prevBtn.addEventListener('click', () => {
    prevSlide();
    stopAutoSlide();
    startAutoSlide(); // restart timer
  });
  nextBtn.addEventListener('click', () => {
    nextSlide();
    stopAutoSlide();
    startAutoSlide();
  });
  
  // Touch swipe
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoSlide();
  });
  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? prevSlide() : nextSlide();
    }
    startAutoSlide();
  });
  
  // Hover pause
  track.addEventListener('mouseenter', stopAutoSlide);
  track.addEventListener('mouseleave', startAutoSlide);
  
  // Klik gambar untuk fullscreen? (placeholder)
  track.addEventListener('click', () => {
    // Bisa implementasi lightbox nanti
    console.log('Open fullscreen viewer');
  });
  
  // Zoom hint: bisa juga trigger lightbox
  zoomHint.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Open zoom view');
  });
  
  // Inisialisasi
  buildGallery();
  startAutoSlide();
})();
