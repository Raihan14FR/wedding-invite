const audioToggle = document.getElementById('audio-toggle');
let audioContext, audioElement, gainNode, isPlaying = false, fadeInterval;
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio('assets/audio/ambient.mp3');
    audioElement.loop = true;
    const track = audioContext.createMediaElementSource(audioElement);
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    track.connect(gainNode).connect(audioContext.destination);
}
function fadeIn() { if (fadeInterval) clearInterval(fadeInterval); let vol = 0; fadeInterval = setInterval(() => { if (vol < 0.35) { vol += 0.02; gainNode.gain.value = vol; } else clearInterval(fadeInterval); }, 50); }
function fadeOut(callback) { if (fadeInterval) clearInterval(fadeInterval); let vol = gainNode.gain.value; fadeInterval = setInterval(() => { if (vol > 0.02) { vol -= 0.03; gainNode.gain.value = vol; } else { clearInterval(fadeInterval); gainNode.gain.value = 0; if (callback) callback(); } }, 30); }
audioToggle.addEventListener('click', async () => {
    if (!audioContext) initAudio();
    if (audioContext.state === 'suspended') await audioContext.resume();
    if (!isPlaying) { audioElement.play(); fadeIn(); audioToggle.innerHTML = '♩'; isPlaying = true; }
    else { fadeOut(() => { audioElement.pause(); audioToggle.innerHTML = '♪'; isPlaying = false; }); }
});
document.body.addEventListener('click', () => { if (!audioContext) initAudio(); if (audioContext.state === 'suspended' && !isPlaying) { audioContext.resume().then(() => { audioElement.play(); fadeIn(); audioToggle.innerHTML = '♩'; isPlaying = true; }); } }, { once: true });