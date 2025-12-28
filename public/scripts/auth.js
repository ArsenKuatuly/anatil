const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;

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

            // ✅ редирект на защищённую страницу
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
