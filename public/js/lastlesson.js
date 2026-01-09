document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await authFetch("/api/lessons/progress/current");
        const data = await res.json();

        if (!data.success) return;

        document.getElementById("lessonPercent").textContent =
            data.percent + "%";

        document.getElementById("courseTitle").textContent =
            data.course.title;

        document.getElementById("courseDesc").textContent =
            "Продолжайте обучение";

        document.getElementById("lastLesson").textContent =
            data.lastLesson ? data.lastLesson.title : "—";

        document.getElementById("nextLesson").textContent =
            data.nextLesson ? data.nextLesson.title : "Все уроки пройдены";

        document.getElementById("goToCourseBtn").href =
            `/course.html?slug=${data.course.slug}`;

    } catch (err) {
        console.error("Ошибка загрузки прогресса", err);
    }
});
