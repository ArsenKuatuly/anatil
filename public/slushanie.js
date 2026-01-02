const subjectButtons = document.querySelectorAll('.exam__subject');
const globalAudioBlock = document.getElementById('globalAudioBlock');
const globalAudio = document.getElementById('globalAudio');

function showListeningAudio(show) {
    if (show) {
        globalAudioBlock.classList.add('is-visible');
    } else {
        globalAudio.pause();
        globalAudio.currentTime = 0;
        globalAudioBlock.classList.remove('is-visible');
    }
}

subjectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        showListeningAudio(btn.dataset.subject === 'listening');
    });
});
