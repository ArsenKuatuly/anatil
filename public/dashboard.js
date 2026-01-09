document.addEventListener("DOMContentLoaded", async () => {

    /* === LOGO (домой или в дэшборд) === */
    const logoBtn = document.getElementById("logoBtn");
    if (logoBtn) {
        logoBtn.addEventListener("click", async () => {
            try {
                const res = await fetch("/api/me", {
                    credentials: "include"
                });

                window.location.href =
                    res.status === 401
                        ? "/index.html"
                        : "/dashboard.html";
            } catch {
                window.location.href = "/index.html";
            }
        });
    }

    /* === LOGOUT === */
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await fetch("/logout", { credentials: "include" });
            window.location.href = "/index.html";
        });
    }

    /* === ПОЛЬЗОВАТЕЛЬ / АДМИН === */
    let user = null;

    try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
            const data = await res.json();
            user = data.user || data;
        }
    } catch (e) {
        console.warn("Не удалось получить пользователя");
    }

    /* === ПОКАЗ КНОПКИ АДМИНА === */
    if (user?.role === "admin") {
        const adminBtn = document.getElementById("adminBtn");
        if (adminBtn) {
            adminBtn.style.display = "inline-block";
        }
    }

    /* === МОЙ КУРС === */
    initCourseButton();
});


/* === КНОПКА ПЕРЕХОДА К КУРСУ === */
async function initCourseButton() {
    const btn = document.getElementById("goToCourseBtn");
    if (!btn) return;

    try {
        const res = await authFetch("/api/my-course");
        const data = await res.json();

        if (!data.success || !data.course) return;

        btn.addEventListener("click", () => {
            window.location.href = `/courses/${data.course.slug}`;
        });

    } catch (e) {
        console.error("Ошибка загрузки курса", e);
    }
}
