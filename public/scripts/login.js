document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const message = document.getElementById("message");

    const loginInput = document.getElementById("login");
    const passwordInput = document.querySelector(".js-password");

    if (!loginBtn || !message || !loginInput || !passwordInput) {
        console.error("Поля авторизации не найдены", {
            loginBtn: !!loginBtn,
            message: !!message,
            loginInput: !!loginInput,
            passwordInput: !!passwordInput
        });
        return;
    }

    function setMsg(text, ok) {
        message.textContent = text || "";
        message.className = "auth__message";
        if (!text) return;
        message.classList.add(ok ? "auth__message--success" : "auth__message--error");
    }

    function clearErrors() {
        loginInput.classList.remove("auth__input--error");
        passwordInput.classList.remove("auth__input--error");
    }

    function markErrors(inputs) {
        inputs.forEach(i => i.classList.add("auth__input--error"));
    }

    async function doLogin() {
        clearErrors();
        setMsg("", false);

        const login = loginInput.value.trim();
        const password = passwordInput.value;

        if (!login || !password) {
            setMsg("Заполните все поля", false);
            markErrors([loginInput, passwordInput]);
            return;
        }

        loginBtn.disabled = true;

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // ВАЖНО для сессии-cookie, если фронт на другом origin (63342)
                credentials: "include",
                body: JSON.stringify({ login, password })
            });

            const result = await res.json().catch(() => null);

            if (!result) {
                setMsg("Сервер вернул некорректный ответ", false);
                return;
            }

            setMsg(result.message || (result.success ? "Вход выполнен" : "Ошибка"), !!result.success);

            if (result.success) {
                // можно редиректить на dashboard, у тебя он защищен auth middleware
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 400);
            }
        } catch (e) {
            setMsg("Ошибка соединения с сервером", false);
        } finally {
            loginBtn.disabled = false;
        }
    }

    loginBtn.addEventListener("click", doLogin);

    // Enter в любом поле
    [loginInput, passwordInput].forEach(el => {
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") doLogin();
        });
    });

    // "Забыли пароль?" (пока заглушка, чтобы не было мёртвой кнопки)
    const forgotBtn = document.getElementById("forgotBtn");
    if (forgotBtn) {
        forgotBtn.addEventListener("click", () => {
            setMsg("Функция восстановления пароля пока не подключена", false);
        });
    }
});
