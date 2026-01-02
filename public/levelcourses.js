const courseCard = document.getElementById("courseCard");
const goProfile = document.getElementById("goProfile");
const goHome = document.getElementById("goHome");

/* ================= ЗАГРУЗКА КУРСА ================= */

async function loadMyCourse() {
    try {
        const res = await fetch("/api/my-course", {
            credentials: "include"
        });

        // ❌ не авторизован
        if (res.status === 401) {
            courseCard.innerHTML = `
                <div class="course course--empty">
                    <p>Войдите, чтобы увидеть рекомендованный курс</p>
                </div>
            `;
            return;
        }

        const data = await res.json();

        if (!data.success) {
            courseCard.innerHTML = `
                <div class="course course--empty">
                    <p>${data.message || "Сначала пройдите тест"}</p>
                </div>
            `;
            return;
        }

        const course = data.course;

        courseCard.innerHTML = `
            <div class="course__card">
                <h2 class="course__title">${course.title}</h2>
                <p class="course__level">
                    Уровень: ${translateLevel(course.level)}
                </p>

                <button class="btn btn--primary" id="openCourse">
                    Перейти к курсу
                </button>
            </div>
        `;

        document
            .getElementById("openCourse")
            .addEventListener("click", () => {
                window.location.href = `/courses/${course.slug}`;
            });

    } catch (err) {
        console.error(err);
        courseCard.innerHTML = `
            <div class="course course--error">
                <p>Ошибка загрузки курса</p>
            </div>
        `;
    }
}

loadMyCourse();

/* ================= КНОПКИ ================= */

goProfile.addEventListener("click", () => {
    window.location.href = "/profile.html";
});

/**
 * 🧠 УМНАЯ КНОПКА "НА ГЛАВНУЮ"
 * авторизован → dashboard.html
 * гость → index.html
 */
goHome.addEventListener("click", async () => {
    try {
        const res = await fetch("/api/my-course", {
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

/* ================= ПЕРЕВОД УРОВНЕЙ ================= */

function translateLevel(level) {
    const map = {
        elementary: "Элементарный",
        basic: "Базовый",
        intermediate: "Средний",
        upper: "Выше среднего",
        advanced: "Высокий",

        // если приходит из БД
        A1: "Элементарный",
        A2: "Базовый",
        B1: "Средний",
        B2: "Выше среднего",
        C1: "Высокий"
    };

    return map[level] || level;
}
