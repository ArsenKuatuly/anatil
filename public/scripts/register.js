const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
        const login = document.getElementById("login");
        const password = document.getElementById("password");
        const passwordRepeat = document.getElementById("passwordRepeat");

        message.textContent = "";
        message.className = "auth__message";

        [login, password, passwordRepeat].forEach(input =>
            input.classList.remove("auth__input--error")
        );

        if (!login.value || !password.value || !passwordRepeat.value) {
            showError("Заполните все поля", [login, password, passwordRepeat]);
            return;
        }

        if (password.value !== passwordRepeat.value) {
            showError("Пароли не совпадают", [password, passwordRepeat]);
            return;
        }

        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                login: login.value,
                password: password.value
            })
        });

        const result = await response.json();

        message.textContent = result.message;
        message.classList.add(
            result.success ? "auth__message--success" : "auth__message--error"
        );
    });
}

function showError(text, inputs) {
    message.textContent = text;
    message.classList.add("auth__message--error");
    inputs.forEach(input => input.classList.add("auth__input--error"));
}
