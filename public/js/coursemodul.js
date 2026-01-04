console.log("coursemodul.js загружен");

document.addEventListener("DOMContentLoaded", () => {

    const modulesEl = document.getElementById("modules");
    const courseTitleEl = document.getElementById("courseTitle");

    if (!modulesEl) {
        console.error("❌ #modules не найден");
        return;
    }

    const slug = window.location.pathname.split("/").pop();

    loadCourse();

    async function loadCourse() {
        try {
            const res = await authFetch(`/api/course/${slug}`);
            const data = await res.json();

            console.log("📦 FULL RESPONSE:", data);

            if (!data.success) {
                modulesEl.innerHTML = "<p>Курс не найден</p>";
                return;
            }

            /* 🔥 ВАЖНО: проверка course */
            if (data.course && courseTitleEl) {
                courseTitleEl.textContent = data.course.title;
            }

            if (!Array.isArray(data.modules)) {
                modulesEl.innerHTML = "<p>Модули не найдены</p>";
                return;
            }

            renderModules(data.modules);

        } catch (err) {
            console.error("❌ ошибка загрузки курса", err);
            modulesEl.innerHTML = "<p>Ошибка загрузки курса</p>";
        }
    }

    function renderModules(modules) {
        modulesEl.innerHTML = "";

        modules.forEach(m => {

            if (!Array.isArray(m.lessons)) {
                console.error("❌ У модуля нет lessons", m);
                return;
            }

            m.completed = Number(m.completed) === 1;
            m.locked = Number(m.locked) === 1;

            const moduleEl = document.createElement("section");
            moduleEl.className = "module";

            moduleEl.innerHTML = `
            <div class="module-header">
                <h2>${m.title}</h2>
            </div>
            <div class="lessons"></div>
        `;

            const lessonsEl = moduleEl.querySelector(".lessons");

            const firstUncompletedIndex =
                m.lessons.findIndex(l => !Number(l.completed));

            m.lessons.forEach((lesson, index) => {
                lesson.completed = Number(lesson.completed) === 1;

                const canOpen =
                    !m.locked &&
                    (
                        lesson.completed ||
                        index === firstUncompletedIndex ||
                        firstUncompletedIndex === -1
                    );

                const lessonEl = document.createElement("div");
                lessonEl.className =
                    "lesson" +
                    (lesson.completed ? " completed" : "") +
                    (!canOpen ? " locked" : "");

                lessonEl.innerHTML = `
                <span>${lesson.title}</span>
                ${lesson.completed ? `<span>✔</span>` : ``}
            `;

                if (canOpen) {
                    lessonEl.addEventListener("click", () => {
                        window.location.href = `/lesson.html?id=${lesson.id}`;
                    });
                }

                lessonsEl.appendChild(lessonEl);
            });

            modulesEl.appendChild(moduleEl);
        });
    }





});
