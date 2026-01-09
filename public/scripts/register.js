const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

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

        message.textContent = "";
        message.className = "auth__message";

        [loginInput, password, passwordRepeat].forEach(input =>
            input.classList.remove("auth__input--error")
        );

        if (!loginInput.value || !password.value || !passwordRepeat.value) {
            showError("Заполните все поля", [loginInput, password, passwordRepeat]);
            return;
        }

        if (password.value !== passwordRepeat.value) {
            showError("Пароли не совпадают", [password, passwordRepeat]);
            return;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login: loginInput.value,
                    password: password.value
                })
            });

            const result = await response.json();

            message.textContent = result.message;
            message.classList.add(
                result.success
                    ? "auth__message--success"
                    : "auth__message--error"
            );

            if (result.success) {
                setTimeout(() => {
                    window.location.href = "/auth.html";
                }, 700);
            }

        } catch (err) {
            message.textContent = "Ошибка соединения с сервером";
            message.classList.add("auth__message--error");
        }
    });
}

function showError(text, inputs) {
    message.textContent = text;
    message.classList.add("auth__message--error");
    inputs.forEach(input => input.classList.add("auth__input--error"));
}
