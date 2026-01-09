document.addEventListener("DOMContentLoaded", () => {

    /* === LOGO (переход домой / в дэшборд) === */
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
            await fetch("/logout");
            window.location.href = "/index.html";
        });
    }

    /* === МОЙ КУРС === */
    initCourseButton();

});


async function initCourseButton() {
    const btn = document.getElementById("goCourseBtn");
    if (!btn) return;

    try {
        const res = await authFetch("/api/my-course");
        const data = await res.json();

        if (!data.success) return;

        btn.addEventListener("click", () => {
            window.location.href = `/courses/${data.course.slug}`;
        });
    } catch (e) {
        console.error("Ошибка загрузки курса", e);
    }
}
