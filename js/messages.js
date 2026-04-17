// messages.js - Ucapan Tamu + AI Auto-Reply (Real-time Update)
(function() {
  const form = document.getElementById('messageForm');
  const feed = document.getElementById('messagesFeed');
  const textarea = document.getElementById('msgPesan');
  const counter = document.getElementById('charCounter');
  
  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length}/300`;
  });
  
  // Fungsi untuk membuat atau memperbarui elemen card pesan
  function upsertMessageCard(msg, key) {
    let card = document.querySelector(`.message-card[data-key="${key}"]`);
    
    if (!card) {
      // Buat card baru
      card = document.createElement('div');
      card.className = 'message-card';
      card.dataset.key = key;
      feed.prepend(card);
    }
    
    // Isi konten card
    card.innerHTML = `
      <div class="message-name">${escapeHtml(msg.nama)}</div>
      <div class="message-text">${escapeHtml(msg.pesan)}</div>
      ${msg.balasan_ai 
        ? `<div class="ai-reply">💬 ${escapeHtml(msg.balasan_ai)}</div>` 
        : `<div class="ai-reply" style="opacity:0.6; font-style:italic;">Menunggu balasan...</div>`
      }
    `;
  }
  
  // Escape HTML sederhana
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Listener untuk pesan baru (child_added)
  db.ref('pesan').limitToLast(30).on('child_added', (snap) => {
    const msg = snap.val();
    upsertMessageCard(msg, snap.key);
  });
  
  // Listener untuk perubahan pesan (child_changed) -> saat balasan AI ditambahkan
  db.ref('pesan').limitToLast(30).on('child_changed', (snap) => {
    const msg = snap.val();
    upsertMessageCard(msg, snap.key);
  });
  
  // Kirim pesan
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = document.getElementById('msgNama').value.trim();
    const pesan = textarea.value.trim();
    if (!nama || !pesan) return;
    
    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Mengirim...';
    
    try {
      // 1. Simpan pesan dulu (tanpa balasan)
      const newMsgRef = db.ref('pesan').push();
      await newMsgRef.set({
        nama,
        pesan,
        waktu: firebase.database.ServerValue.TIMESTAMP
      });
      
      // 2. Panggil AI untuk dapatkan balasan
      const systemPrompt = `Kamu adalah asisten undangan pernikahan Islami yang hangat dan tulus. Tugasmu membalas ucapan selamat dari tamu dengan gaya yang bervariasi — jangan pernah menggunakan template yang sama dua kali. Variasikan panjang, gaya, doa Islami (Barakallahu fiikum, Jazakallahu khairan, Aamiin ya Rabbal 'alamin, dll). Bahasa Indonesia, tanpa emoji. Panjang 1-3 kalimat.`;
      
      let aiReply = '';
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            system: systemPrompt,
            messages: [{ role: 'user', content: pesan }]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          aiReply = data.content[0].text;
        } else {
          console.error('AI API error:', response.status);
          // Fallback reply jika AI gagal
          const fallbacks = [
            "Terima kasih atas doa dan ucapannya. Semoga Allah membalas kebaikan Anda.",
            "Aamiin ya Rabbal 'alamin. Jazakallahu khairan atas doa yang indah.",
            "Kami sangat tersentuh dengan ucapan Anda. Barakallahu fiikum.",
            "Doa Anda sangat berarti bagi kami. Semoga Allah meridhoi langkah kita semua."
          ];
          aiReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
      } catch (apiError) {
        console.warn('AI fetch error:', apiError);
        aiReply = "Terima kasih atas doanya. Semoga Allah memberkahi Anda.";
      }
      
      // 3. Update pesan dengan balasan AI
      await newMsgRef.update({ balasan_ai: aiReply });
      
      // Reset form
      form.reset();
      counter.textContent = '0/300';
    } catch (error) {
      alert('Gagal mengirim pesan. Coba lagi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"/></svg> Kirim Ucapan`;
    }
  });
})();
