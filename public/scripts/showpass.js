// Универсальный показ/скрытие пароля.
// Работает для всех блоков, где есть:
//  - input.js-password
//  - img.js-toggle-password (рядом с ним, в том же .auth__password-wrapper)

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.js-toggle-password');
  if (!btn) return;

  const wrapper = btn.closest('.auth__password-wrapper');
  if (!wrapper) return;

  const input = wrapper.querySelector('.js-password');
  if (!input) return;

  const isHidden = input.getAttribute('type') === 'password';
  input.setAttribute('type', isHidden ? 'text' : 'password');

  btn.classList.toggle('is-visible', isHidden);

  // Если у тебя есть отдельная иконка для "скрыть", можешь раскомментировать:
  // btn.src = isHidden ? '/imgs/hidepass.png' : '/imgs/showpass.png';
});
