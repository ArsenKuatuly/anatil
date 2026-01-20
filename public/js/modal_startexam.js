
    const startBtn = document.getElementById('startTestBtn');
    const modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('modal--active');
});

    cancelBtn.addEventListener('click', () => {
    modal.classList.remove('modal--active');
});

    confirmBtn.addEventListener('click', () => {
    // переход на страницу теста
    window.location.href = 'test.html';
});

