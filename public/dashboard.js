

async function initCourseButton() {
    const res = await authFetch("/api/my-course");
    const data = await res.json();

    if (!data.success) return;

    document.getElementById("goCourseBtn").addEventListener("click", () => {
        window.location.href = `/courses/${data.course.slug}`;
    });
}

initCourseButton();
