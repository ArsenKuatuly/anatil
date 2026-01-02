document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("recommendedCourse");

    try {
        const res = await fetch("/api/my-course");
        const data = await res.json();

        if (!data.success) {
            container.innerHTML = "<p>Вы ещё не проходили тест</p>";
            return;
        }

        const course = data.course;

        container.innerHTML = `
            <div style="
                margin-top:20px;
                background:#f7f9fc;
                padding:20px;
                border-radius:12px;
            ">
                <h3>${course.title}</h3>
                <p>Уровень: <b>${humanLevel(course.level)}</b></p>

                <button
                    style="
                        margin-top:10px;
                        padding:10px 16px;
                        background:#1e88e5;
                        color:#fff;
                        border:none;
                        border-radius:6px;
                        cursor:pointer;
                    "
                    onclick="window.location.href='/courses/${course.slug}'"
                >
                    Перейти к курсу
                </button>
            </div>
        `;
    } catch (e) {
        console.error(e);
        container.innerHTML = "<p>Ошибка загрузки курса</p>";
    }
});

function humanLevel(level) {
    const map = {
        elementary: "Элементарный",
        basic: "Базовый",
        intermediate: "Средний",
        upper: "Выше среднего",
        advanced: "Высокий"
    };
    return map[level] || level;
}
