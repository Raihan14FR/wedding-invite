// ticket.js - Sistem Tiket (dengan perbaikan bug message)
(function() {
  const form = document.getElementById('ticketForm');
  const messageDiv = document.getElementById('ticketMessage');
  const resultDiv = document.getElementById('ticketResult');
  const registeredSpan = document.getElementById('registeredCount');
  const submitBtn = document.getElementById('submitTicketBtn');
  
  let totalRegistered = 0;
  
  // Real-time listener untuk jumlah terdaftar
  db.ref('meta/total_terdaftar').on('value', (snap) => {
    totalRegistered = snap.val() || 0;
    registeredSpan.textContent = totalRegistered;
  });
  
  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'WD-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = document.getElementById('nama').value.trim();
    const jumlah = parseInt(document.getElementById('jumlah').value);
    
    if (!nama) return;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Memproses...';
    messageDiv.textContent = ''; // Reset pesan
    
    try {
      // Cek apakah nama sudah terdaftar
      const snapshot = await db.ref('tamu').orderByChild('nama').equalTo(nama).once('value');
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val())[0];
        throw new Error(`Anda sudah terdaftar, Silakan hubungi mempelai apabila mengalami kendala`);
      }
      
      const kode = generateCode();
      const newTamuRef = db.ref('tamu').push();
      const data = {
        nama,
        jumlah,
        kode,
        waktu_daftar: firebase.database.ServerValue.TIMESTAMP,
        status: 'belum_hadir'
      };
      
      await newTamuRef.set(data);
      await db.ref('meta/total_terdaftar').set(totalRegistered + 1);
      
      // Tampilkan tiket
      showTicket(data);
      form.reset();
      form.style.display = 'none';
      messageDiv.textContent = ''; // Pastikan pesan hilang
    } catch (error) {
      messageDiv.textContent = error.message;
      messageDiv.style.color = '#d32f2f';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12H4M12 4V20" stroke="currentColor" stroke-width="2"/></svg> Daftar Sekarang`;
    }
  });
  
  function showTicket(data) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div class="ticket-card">
        <div class="ticket-header">
          <div class="ticket-couple">Raihan & Lisa</div>
          <div class="ticket-date">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z"/></svg>
            <span>10 Juli 2026</span>
          </div>
        </div>
        
        <div class="ticket-detail-row">
          <span class="ticket-detail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-10c-4.2 0-8 3.22-8 8.2 0 5.2 7.3 11.8 7.6 12.1.2.2.5.2.7 0 .3-.3 7.6-6.9 7.6-12.1C20 5.22 16.2 2 12 2z"/></svg></span>
          <div class="ticket-detail-content">
            <div class="ticket-detail-label">Nama Tamu</div>
            <div class="ticket-detail-value">${data.nama}</div>
          </div>
        </div>
        
        <div class="ticket-detail-row">
          <span class="ticket-detail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12H4M12 4V20" stroke="currentColor" stroke-width="2"/></svg></span>
          <div class="ticket-detail-content">
            <div class="ticket-detail-label">Kode Tiket</div>
            <div class="ticket-detail-value" style="font-family: monospace; letter-spacing: 2px;">${data.kode}</div>
          </div>
        </div>
        
        <div class="ticket-divider"></div>
        
        <div class="ticket-qr-section">
          <div class="qr-label">Scan untuk masuk</div>
          <div class="ticket-qr" id="qrcode"></div>
        </div>
        
        <div class="ticket-footer-note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <span>Tunjukkan tiket ini kepada panitia</span>
        </div>
      </div>
      
      <div class="ticket-actions">
        <button class="ticket-action-btn btn-primary-ticket" id="saveTicketBtn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Simpan Tiket
        </button>
        <button class="ticket-action-btn btn-outline-ticket" id="shareTicketBtn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
          Bagikan via WhatsApp
        </button>
      </div>
    `;
    
    new QRCode(document.getElementById("qrcode"), {
      text: data.kode,
      width: 160,
      height: 160,
      colorDark: "#1a1a1a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    
    document.getElementById('saveTicketBtn').addEventListener('click', async function() {
      const ticketCard = document.querySelector('.ticket-card');
      if (!ticketCard) return;
      
      try {
        const btn = this;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 6v6l4 2"/></svg> Memproses...`;
        btn.disabled = true;
        
        const canvas = await html2canvas(ticketCard, {
          scale: 2.5,
          backgroundColor: '#FDF8F2',
          allowTaint: false,
          useCORS: true,
          logging: false
        });
        
        const link = document.createElement('a');
        link.download = `Tiket-RaihanLisa-${data.kode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      } catch (error) {
        console.error('Gagal mengunduh:', error);
        alert('Gagal mengunduh tiket. Silakan coba screenshot manual.');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }
    });
    
    document.getElementById('shareTicketBtn').addEventListener('click', () => {
      const text = `Halo, saya sudah mendaftar untuk hadir di pernikahan Raihan & Lisa. Kode tiket saya: ${data.kode}. Sampai jumpa!`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    });
  }
})();
