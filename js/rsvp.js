// rsvp.js - dengan kode unik, QR persist, cek duplikat nama, dan export ke Firebase
const form = document.getElementById('rsvp-form');
const guestCountGroup = document.getElementById('guest-count-group');
const radioHadir = document.querySelector('input[value="hadir"]');
const radioTidak = document.querySelector('input[value="tidak"]');
const savedGuestDiv = document.getElementById('saved-guest-info');
const savedCodeDisplay = document.getElementById('saved-code-display');
const savedQrContainer = document.getElementById('saved-qrcode');
const resetBtn = document.getElementById('reset-guest-btn');
const rsvpErrorDiv = document.getElementById('rsvp-error');

let rsvpData = JSON.parse(localStorage.getItem('wedding_rsvp')) || [];
let currentGuest = JSON.parse(localStorage.getItem('current_guest'));

// Inisialisasi Firebase (sama dengan index.html)
const firebaseConfig = {
    apiKey: "AIzaSyCDjGcWD3PZbr8UAYSGFgiyLFNH-7uuVx0",
    authDomain: "undangan-6f675.firebaseapp.com",
    databaseURL: "https://undangan-6f675-default-rtdb.firebaseio.com",
    projectId: "undangan-6f675",
    storageBucket: "undangan-6f675.firebasestorage.app",
    messagingSenderId: "852724173933",
    appId: "1:852724173933:web:e727d4b232a5632d588364",
    measurementId: "G-SES81QSV4T"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const guestDataRef = database.ref('guest_data');

function generateUniqueCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function toggleGuestCount() {
    if (radioHadir.checked) guestCountGroup.style.display = 'block';
    else guestCountGroup.style.display = 'none';
}
radioHadir?.addEventListener('change', toggleGuestCount);
radioTidak?.addEventListener('change', toggleGuestCount);

function isNameDuplicate(name) {
    const normalized = name.trim().toLowerCase();
    return rsvpData.some(guest => guest.name.toLowerCase() === normalized);
}

function displaySavedGuest() {
    if (currentGuest && currentGuest.code) {
        savedCodeDisplay.innerText = currentGuest.code;
        savedQrContainer.innerHTML = '';
        new QRCode(savedQrContainer, {
            text: currentGuest.code,
            width: 140,
            height: 140
        });
        savedGuestDiv.classList.remove('hidden');
        form.classList.add('hidden');
    } else {
        savedGuestDiv.classList.add('hidden');
        form.classList.remove('hidden');
    }
}

function saveGuestAfterRSVP(name, attendance, guestCount, code) {
    currentGuest = { name, attendance, guestCount, code, timestamp: new Date().toISOString() };
    localStorage.setItem('current_guest', JSON.stringify(currentGuest));
    const existing = rsvpData.find(t => t.code === code);
    if (!existing) {
        rsvpData.push({ id: Date.now(), name, attendance, guestCount, code, date: new Date().toISOString() });
        localStorage.setItem('wedding_rsvp', JSON.stringify(rsvpData));
    }
    displaySavedGuest();
}

function resetGuest() {
    localStorage.removeItem('current_guest');
    currentGuest = null;
    displaySavedGuest();
    form.reset();
    guestCountGroup.style.display = 'none';
    const successDiv = document.getElementById('rsvp-success');
    successDiv.classList.add('hidden');
    successDiv.innerHTML = '';
    rsvpErrorDiv.classList.add('hidden');
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
    const guestCount = document.getElementById('guest-count')?.value || '0';
    
    if (!name || !attendance) {
        alert('Isi nama dan status kehadiran');
        return;
    }
    
    if (isNameDuplicate(name)) {
        rsvpErrorDiv.innerHTML = `
            <p>Nama "${name}" sudah terdaftar sebelumnya.</p>
            <p>Jika Anda mengalami kendala, silakan hubungi panitia melalui nomor kontak di bagian bawah halaman.</p>
        `;
        rsvpErrorDiv.classList.remove('hidden');
        setTimeout(() => rsvpErrorDiv.classList.add('hidden'), 6000);
        return;
    }
    
    const uniqueCode = generateUniqueCode();
    saveGuestAfterRSVP(name, attendance, guestCount, uniqueCode);
    
    const successDiv = document.getElementById('rsvp-success');
    successDiv.innerHTML = `<p>Konfirmasi tersimpan, ${name}. Kode unik Anda: <strong>${uniqueCode}</strong></p>`;
    successDiv.classList.remove('hidden');
    
    if (attendance === 'hadir') {
        for (let i = 0; i < 100; i++) {
            const conf = document.createElement('div');
            conf.classList.add('confetti');
            conf.style.left = Math.random() * 100 + '%';
            conf.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
            conf.style.animationDuration = 1 + Math.random() * 2 + 's';
            document.body.appendChild(conf);
            setTimeout(() => conf.remove(), 2500);
        }
    }
    setTimeout(() => successDiv.classList.add('hidden'), 5000);
});

resetBtn?.addEventListener('click', resetGuest);

// Fungsi export ke Firebase (dipanggil dari tombol admin)
async function exportToFirebase() {
    const allGuests = JSON.parse(localStorage.getItem('wedding_rsvp')) || [];
    await guestDataRef.set(allGuests);
    alert(`✅ Data ${allGuests.length} tamu berhasil disinkronkan ke Firebase.`);
}
window.exportToFirebase = exportToFirebase;

displaySavedGuest();