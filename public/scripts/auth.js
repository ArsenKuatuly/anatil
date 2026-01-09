const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const loginInput = document.getElementById("login");
        const passwordInput = document.querySelector(".js-password");

        if (!loginInput || !passwordInput) {
            console.error("Поля логина или пароля не найдены");
            return;
        }

        const login = loginInput.value;
        const password = passwordInput.value;

        message.textContent = "";
        message.className = "auth__message";

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password })
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
                    window.location.href = "/dashboard";
                }, 500);
            }
        } catch (err) {
            message.textContent = "Ошибка соединения с сервером";
            message.classList.add("auth__message--error");
        }
    });
}
