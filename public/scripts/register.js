const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

// если у тебя другой endpoint — поменяй тут
const REGISTER_ENDPOINT = "/register";
const REDIRECT_AFTER_SUCCESS = "/auth.html";

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const loginInput = document.getElementById("login");
    const passwordInputs = document.querySelectorAll(".js-password");

    if (!loginInput || passwordInputs.length < 2) {
      console.error("Поля регистрации не найдены");
      return;
    }

    const password = passwordInputs[0];
    const passwordRepeat = passwordInputs[1];

    resetMessage();
    clearInputErrors([loginInput, password, passwordRepeat]);

    // ===== Валидация как в TSX-дизайне =====
    if (!loginInput.value.trim() || !password.value || !passwordRepeat.value) {
      showError("Заполните все поля", [loginInput, password, passwordRepeat]);
      return;
    }

    if (loginInput.value.trim().length < 3) {
      showError("Логин должен содержать минимум 3 символа", [loginInput]);
      return;
    }

    if (password.value.length < 6) {
      showError("Пароль должен содержать минимум 6 символов", [password]);
      return;
    }

    if (password.value !== passwordRepeat.value) {
      showError("Пароли не совпадают", [password, passwordRepeat]);
      return;
    }

    // ===== Отправка =====
    setLoading(true);

    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: loginInput.value.trim(),
          password: password.value,
        }),
      });

      // даже если 4xx/5xx — попробуем прочитать json с сообщением
      const result = await safeJson(response);

      // сервер может вернуть {success, message}
      const success = Boolean(result && result.success);
      const text = (result && result.message) ||
        (response.ok ? "Успешно" : "Ошибка регистрации");

      setMessage(text, success ? "success" : "error");

      if (success) {
        setTimeout(() => {
          window.location.href = REDIRECT_AFTER_SUCCESS;
        }, 700);
      }

    } catch (err) {
      setMessage("Ошибка соединения с сервером", "error");
    } finally {
      setLoading(false);
    }
  });
}

function showError(text, inputs) {
  setMessage(text, "error");
  inputs.forEach((input) => input.classList.add("auth__input--error"));
}

function resetMessage() {
  if (!message) return;
  message.textContent = "";
  message.className = "auth__message";
}

function setMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.classList.remove("auth__message--success", "auth__message--error");
  message.classList.add(type === "success" ? "auth__message--success" : "auth__message--error");
}

function clearInputErrors(inputs) {
  inputs.forEach((input) => input.classList.remove("auth__input--error"));
}

function setLoading(isLoading) {
  if (!registerBtn) return;
  registerBtn.disabled = isLoading;
  registerBtn.classList.toggle("is-loading", isLoading);
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
