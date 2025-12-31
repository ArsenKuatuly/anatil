(async function () {
    const form = document.getElementById("profileForm");
    const avatarInput = document.getElementById("avatarInput");
    const avatarImg = document.getElementById("avatarImg");

    if (!form) return;

    /* ===== LOAD PROFILE ===== */
    try {
        const res = await fetch("/api/profile", {
            credentials: "include"
        });

        const data = await res.json();

        if (data.profile) {
            Object.keys(data.profile).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) field.value = data.profile[key] || "";
            });

            // ✅ аватар
            if (data.profile.avatar && avatarImg) {
                avatarImg.src = data.profile.avatar;
            }
        }
    } catch (e) {
        console.error("Ошибка загрузки профиля", e);
    }

    /* ===== SAVE PROFILE (TEXT DATA) ===== */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        const res = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
            alert("Профиль сохранён");
        } else {
            alert("Ошибка сохранения");
        }
    });

    /* ===== AVATAR UPLOAD ===== */
    if (avatarInput) {
        avatarInput.addEventListener("change", async () => {
            const file = avatarInput.files[0];
            if (!file) return;

            const avatarData = new FormData();
            avatarData.append("avatar", file);

            const res = await fetch("/api/profile/avatar", {
                method: "POST",
                credentials: "include",
                body: avatarData
            });

            const result = await res.json();

            if (result.success && avatarImg) {
                avatarImg.src = result.avatar + "?t=" + Date.now();
            } else {
                alert("Ошибка загрузки аватара");
            }
        });
    }
})();
