// firebase-config.js - Konfigurasi Firebase
// GANTI DENGAN CONFIG FIREBASE ANDA (sudah diberikan)
const firebaseConfig = {
    apiKey: "AIzaSyCGB58F7pmyYOUchJpvvixi3-QIZFHJbjY",
    authDomain: "inveteweddingjuly26.firebaseapp.com",
    databaseURL: "https://inveteweddingjuly26-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "inveteweddingjuly26",
    storageBucket: "inveteweddingjuly26.firebasestorage.app",
    messagingSenderId: "163723862085",
    appId: "1:163723862085:web:2eaf5e861cf4ffe635032c"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Anthropic API Key (gunakan dengan bijak) - GANTI DENGAN API KEY ANDA
const ANTHROPIC_API_KEY = "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";

// Inisialisasi kapasitas jika belum ada
db.ref('meta').once('value', (snap) => {
  if (!snap.exists()) {
    db.ref('meta').set({ total_terdaftar: 0, kapasitas: 500 });
  }
});
