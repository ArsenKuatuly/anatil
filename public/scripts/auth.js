const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const loginInput = document.getElementById("login");
        const passwordInput = document.querySelector(".js-password");

        if (!loginInput || !passwordInput) return;

        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        message.textContent = "";
        message.className = "auth__message";

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // 🔥 ОБЯЗАТЕЛЬНО
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
                // 🔥 СРАЗУ В DASHBOARD
                window.location.replace("/dashboard");
            }

        } catch (e) {
            message.textContent = "Ошибка сервера";
            message.classList.add("auth__message--error");
        }
    });
}
