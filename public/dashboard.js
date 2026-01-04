

async function initCourseButton() {
    const res = await authFetch("/api/my-course");
    const data = await res.json();

    if (!data.success) return;

    document.getElementById("goCourseBtn").addEventListener("click", () => {
        window.location.href = `/courses/${data.course.slug}`;
    });
}
goHome.addEventListener("click", async () => {
    try {
        const res = await fetch("/api/me", {
            credentials: "include"
        });

        if (res.status === 401) {
            window.location.href = "/index.html";
        } else {
            window.location.href = "/dashboard.html";
        }
    } catch {
        window.location.href = "/index.html";
    }
});


initCourseButton();
