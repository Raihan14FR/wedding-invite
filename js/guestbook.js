// GUESTBOOK.JS - Full version dengan admin mode, hapus pesan, daftar tamu, dan tombol sinkronisasi Firebase
let guestMessages = JSON.parse(localStorage.getItem('wedding_guestbook')) || [];
let adminMode = false;
let clickCount = 0;
let clickTimer = null;

const aiReplies = [
    "Terima kasih atas doa baiknya. Semoga kebaikan kembali kepada Anda.",
    "Harapan yang indah. Kami sangat terharu. Semoga kebahagiaan menyertai.",
    "Amin. Doa Anda seperti bunga yang mekar di taman cinta kami.",
    "Terima kasih telah menulis pesan manis ini. Kami doakan yang terbaik untuk Anda.",
    "Hatur nuhun. Semoga silaturahmi tetap terjaga.",
    "Such a lovely wish. May love always bloom in your life too.",
    "Terima kasih. Doa Anda kami simpan dalam hati. Sampai jumpa di hari bahagia nanti.",
    "Semoga Tuhan membalas kebaikan Anda.",
    "Pesan yang menyentuh. Terima kasih, semoga kita semua diberi kelancaran.",
    "Makasih banyak ya. Doa balik untuk Anda sekeluarga."
];

function generateAIReply(messageText) {
    const lower = messageText.toLowerCase();
    if (lower.includes("love") || lower.includes("cinta"))
        return "Cinta adalah bahasa universal. Terima kasih atas doa cinta Anda. Semoga cinta kami menginspirasi.";
    if (lower.includes("semoga") || lower.includes("amin"))
        return "Aamiin ya Rabbal'alamin. Doa Anda sangat berarti bagi kami.";
    return aiReplies[Math.floor(Math.random() * aiReplies.length)];
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function deleteMessage(id) {
    if (!adminMode) return;
    if (confirm("Hapus pesan ini?")) {
        guestMessages = guestMessages.filter(msg => msg.id !== id);
        localStorage.setItem('wedding_guestbook', JSON.stringify(guestMessages));
        renderMessages();
    }
}

function renderMessages() {
    const container = document.getElementById('messages-list');
    if (!container) return;
    if (guestMessages.length === 0) {
        container.innerHTML = '<div class="empty-message">Belum ada pesan. Jadilah yang pertama.</div>';
        return;
    }
    container.innerHTML = guestMessages.map(msg => `
        <div class="message-card">
            <div class="message-name">${escapeHtml(msg.name)}</div>
            <div class="message-text">"${escapeHtml(msg.message)}"</div>
            <div class="ai-reply">${escapeHtml(msg.aiReply)}</div>
            <div style="font-size:0.7rem; color:#aaa; margin-top:8px; display: flex; justify-content: space-between; align-items: center;">
                <span>${new Date(msg.timestamp).toLocaleString('id-ID')}</span>
                ${adminMode ? `<button class="delete-message-btn" data-id="${msg.id}">Hapus</button>` : ''}
            </div>
        </div>
    `).join('');
    if (adminMode) {
        document.querySelectorAll('.delete-message-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteMessage(parseInt(btn.getAttribute('data-id')));
            });
        });
    }
}

function submitMessage(name, message) {
    if (!name.trim() || !message.trim()) {
        alert("Nama dan pesan tidak boleh kosong");
        return false;
    }
    const aiReply = generateAIReply(message);
    guestMessages.unshift({
        id: Date.now(),
        name: name.trim(),
        message: message.trim(),
        aiReply: aiReply,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('wedding_guestbook', JSON.stringify(guestMessages));
    renderMessages();
    return true;
}

function renderGuestListForAdmin() {
    let container = document.getElementById('admin-guest-list');
    const rsvpData = JSON.parse(localStorage.getItem('wedding_rsvp')) || [];
    if (!container && adminMode) {
        const guestbookScene = document.getElementById('scene6');
        const wall = guestbookScene.querySelector('.messages-wall');
        const newDiv = document.createElement('div');
        newDiv.id = 'admin-guest-list';
        newDiv.className = 'admin-guest-list';
        newDiv.innerHTML = '<h3>Daftar Tamu Terdaftar (Admin)</h3><div class="guest-list-items"></div>';
        wall.parentNode.insertBefore(newDiv, wall.nextSibling);
        container = newDiv;
    }
    if (container && adminMode) {
        const listContainer = container.querySelector('.guest-list-items');
        if (listContainer) {
            listContainer.innerHTML = rsvpData.map(guest => `
                <div class="guest-list-item">
                    <span><strong>${escapeHtml(guest.name)}</strong> (${guest.attendance}) - Kode: ${guest.code}</span>
                    <button class="admin-delete-guest" data-code="${guest.code}">Hapus</button>
                </div>
            `).join('');
            document.querySelectorAll('.admin-delete-guest').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const code = btn.getAttribute('data-code');
                    if (confirm(`Hapus tamu dengan kode ${code}?`)) {
                        let allGuests = JSON.parse(localStorage.getItem('wedding_rsvp')) || [];
                        const newGuests = allGuests.filter(g => g.code !== code);
                        localStorage.setItem('wedding_rsvp', JSON.stringify(newGuests));
                        const current = JSON.parse(localStorage.getItem('current_guest'));
                        if (current && current.code === code) {
                            localStorage.removeItem('current_guest');
                            location.reload();
                        } else {
                            renderGuestListForAdmin();
                        }
                    }
                });
            });
        }
    }
}

// Tambah tombol sinkronisasi Firebase
function addSyncButton() {
    if (!document.getElementById('admin-sync-firebase') && adminMode) {
        const container = document.querySelector('.gift-closing-scene .container');
        if (container) {
            const btn = document.createElement('button');
            btn.id = 'admin-sync-firebase';
            btn.textContent = '📡 Sinkronkan Data Tamu ke Firebase';
            btn.style.margin = '20px auto';
            btn.style.display = 'block';
            btn.style.background = 'var(--gold)';
            btn.style.border = 'none';
            btn.style.padding = '8px 20px';
            btn.style.borderRadius = '40px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                if (window.exportToFirebase) window.exportToFirebase();
                else alert('Fungsi sinkronisasi belum tersedia');
            };
            container.appendChild(btn);
        }
    } else if (document.getElementById('admin-sync-firebase') && !adminMode) {
        document.getElementById('admin-sync-firebase').remove();
    }
}

function enableAdminMode() {
    adminMode = true;
    document.body.classList.add('admin-mode-active');
    renderGuestListForAdmin();
    addSyncButton();
    const title = document.querySelector('#scene6 .scene-title');
    if (title) title.style.borderBottom = '1px solid var(--gold)';
    renderMessages();
}

function disableAdminMode() {
    adminMode = false;
    document.body.classList.remove('admin-mode-active');
    const panel = document.getElementById('admin-guest-list');
    if (panel) panel.remove();
    const syncBtn = document.getElementById('admin-sync-firebase');
    if (syncBtn) syncBtn.remove();
    const title = document.querySelector('#scene6 .scene-title');
    if (title) title.style.borderBottom = '';
    renderMessages();
}

function setupAdminTrigger() {
    const guestbookScene = document.getElementById('scene6');
    if (!guestbookScene) return;
    const title = guestbookScene.querySelector('.scene-title');
    if (!title) return;
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
        clickCount++;
        if (clickTimer) clearTimeout(clickTimer);
        if (clickCount === 5) {
            if (!adminMode) enableAdminMode();
            else disableAdminMode();
            clickCount = 0;
        } else {
            clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
        }
    });
}

// Chat AI
const chatResponses = {
    "lokasi": "Acara berlangsung di Kedung Ringin, Pasir Sakti, Lampung Timur. Tepi pantai.",
    "dress code": "Dress code Garden Bloom: sage, dusty rose, cream, lavender, mocha, blush. Alas kaki nyaman untuk pasir.",
    "waktu": "Akad 08.00 WIB, resepsi 10.00-14.00 WIB, 10 Juli 2026.",
    "rsvp": "Silakan isi form konfirmasi kehadiran di atas.",
    "hadiah": "Transfer ke rekening yang tersedia di bagian Tanda Kasih.",
    "makanan": "Hidangan khas pantai dan Indonesia, termasuk seafood.",
    "parkir": "Area parkir luas, ikuti arahan panitia.",
    "foto": "Boleh berfoto. Gunakan tag #LisaRaihanWedding",
    "ucapan": "Tulis di Wall of Love & Harapan, nanti dibalas AI.",
    "default": "Saya asisten AI pernikahan. Tanyakan tentang lokasi, waktu, dress code, atau hadiah."
};

function getAIResponse(question) {
    const q = question.toLowerCase();
    for (let kw in chatResponses) if (q.includes(kw)) return chatResponses[kw];
    if (q.includes("hai") || q.includes("halo")) return "Halo. Ada yang bisa saya bantu terkait pernikahan Lisa & Raihan?";
    if (q.includes("terima kasih")) return "Sama-sama. Senang bisa membantu.";
    return chatResponses.default;
}

function addChatMessage(sender, text, isBot = false) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = isBot ? 'chat-bot' : 'chat-user';
    div.innerHTML = isBot ? `AI: ${escapeHtml(text)}` : `${escapeHtml(text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    renderMessages();
    setupAdminTrigger();
    
    const submitBtn = document.getElementById('submit-message');
    const nameInput = document.getElementById('guest-name');
    const msgInput = document.getElementById('guest-message');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (submitMessage(nameInput.value, msgInput.value)) {
                nameInput.value = '';
                msgInput.value = '';
                const successDiv = document.getElementById('rsvp-success');
                if (successDiv) {
                    successDiv.innerHTML = 'Pesan terkirim. Balasan AI akan muncul.';
                    successDiv.classList.remove('hidden');
                    setTimeout(() => successDiv.classList.add('hidden'), 3000);
                }
            }
        });
    }
    
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    function handleChat() {
        const q = chatInput.value.trim();
        if (!q) return;
        addChatMessage("Anda", q, false);
        setTimeout(() => addChatMessage("AI", getAIResponse(q), true), 400);
        chatInput.value = '';
    }
    if (sendChat) sendChat.addEventListener('click', handleChat);
    if (chatInput) chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleChat(); });
});