const targetDate = new Date('July 10, 2026 08:00:00').getTime();
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (86400000)) / (3600000));
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    document.getElementById('days').innerHTML = days < 10 ? '0'+days : days;
    document.getElementById('hours').innerHTML = hours < 10 ? '0'+hours : hours;
    document.getElementById('minutes').innerHTML = minutes < 10 ? '0'+minutes : minutes;
    document.getElementById('seconds').innerHTML = seconds < 10 ? '0'+seconds : seconds;
    if (distance < 0) { clearInterval(countdownInterval); document.querySelector('.countdown-container').innerHTML = "<p>Hari Pernikahan Telah Tiba!</p>"; }
}
updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

document.getElementById('add-google')?.addEventListener('click', () => {
    window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+Lisa+%26+Raihan&dates=20260710T010000Z/20260710T070000Z&details=Akad+jam+8+WIB+di+Kedung+Ringin,+Pasir+Sakti', '_blank');
});
document.getElementById('add-ical')?.addEventListener('click', () => {
    alert('Download file .ics (simulasi) — Anda bisa membuat file ics sendiri atau menggunakan link generator');
});