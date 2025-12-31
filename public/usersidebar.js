(async function () {
    try {
        const res = await fetch("/api/me", {
            credentials: "include"
        });

        const data = await res.json();

        if (data.success && data.user) {

            /* ===== LOGIN ===== */
            const loginEl = document.getElementById("sidebarLogin");
            if (loginEl) {
                loginEl.textContent = data.user.login;
            }

            /* ===== AVATAR ===== */
            const avatarImg = document.getElementById("avatarImg");
            if (avatarImg) {
                avatarImg.src = data.user.avatar
                    ? data.user.avatar
                    : "/uploads/avatars/default.png";
            }
        }
    } catch (err) {
        console.error("Не удалось загрузить пользователя", err);
    }
})();

const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.addEventListener("click", () => {
        window.location.href = "/dashboard.html";
    });
}

