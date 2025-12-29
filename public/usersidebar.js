(async function () {
    try {
        const res = await fetch("/api/me", {
            credentials: "include"
        });

        const data = await res.json();

        if (data.success && data.user) {
            const el = document.getElementById("sidebarLogin");
            if (el) {
                el.textContent = data.user.login;
            }
        }
    } catch (err) {
        console.error("Не удалось загрузить пользователя");
    }
})();