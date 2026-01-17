console.log("coursemodul.js загружен");

document.addEventListener("DOMContentLoaded", () => {


    console.log("DOM полностью загружен");
    console.log("finalTaskEl =", document.getElementById("finalTask"));
    console.log("startTaskBtn =", document.getElementById("startTaskBtn"));
    console.log("taskDescription =", document.getElementById("taskDescription"));

    const modulesEl = document.getElementById("modules");
    const courseTitleEl = document.getElementById("courseTitle");
    let finalTaskEl = document.getElementById("finalTask");
    let startTaskBtn = document.getElementById("startTaskBtn");
    let taskDescEl = document.getElementById("taskDescription");

    if (!finalTaskEl) {
        finalTaskEl = document.createElement("div");
        finalTaskEl.id = "finalTask";
        finalTaskEl.className = "final-task";
        document.querySelector(".course").appendChild(finalTaskEl);
    }

    if (!taskDescEl) {
        taskDescEl = document.createElement("p");
        taskDescEl.id = "taskDescription";
        finalTaskEl.appendChild(taskDescEl);
    }

    if (!startTaskBtn) {
        startTaskBtn = document.createElement("button");
        startTaskBtn.id = "startTaskBtn";
        startTaskBtn.disabled = true;
        finalTaskEl.appendChild(startTaskBtn);
    }


    if (!modulesEl) {
        console.error("❌ #modules не найден");
        return;
    }

    const slug = window.location.pathname.split("/").pop();

    loadCourse();

    /* ================== ЗАГРУЗКА КУРСА ================== */
    async function loadCourse() {
        try {
            const res = await authFetch(`/api/course/${slug}`);
            const data = await res.json();

            if (!data.success) {
                modulesEl.innerHTML = "<p>Курс не найден</p>";
                return;
            }

            if (data.course && courseTitleEl) {
                courseTitleEl.textContent = data.course.title;
            }

            if (!Array.isArray(data.modules)) {
                modulesEl.innerHTML = "<p>Модули не найдены</p>";
                return;
            }

            renderModules(data.modules);

            // 🔥 после отрисовки — проверяем прогресс
            checkCourseProgress(data.course, data.modules);



        } catch (err) {
            console.error("❌ ошибка загрузки курса", err);
            modulesEl.innerHTML = "<p>Ошибка загрузки курса</p>";
        }
    }

    /* ================== РЕНДЕР МОДУЛЕЙ ================== */
    function renderModules(modules) {
        modulesEl.innerHTML = "";

        modules.forEach(m => {

            if (!Array.isArray(m.lessons)) return;

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
                const completed = Number(lesson.completed) === 1;

                const canOpen =
                    !Number(m.locked) &&
                    (
                        completed ||
                        index === firstUncompletedIndex ||
                        firstUncompletedIndex === -1
                    );

                const lessonEl = document.createElement("div");
                lessonEl.className =
                    "lesson" +
                    (completed ? " completed" : "") +
                    (!canOpen ? " locked" : "");

                lessonEl.innerHTML = `
                    <span>${lesson.title}</span>
                    ${completed ? `<span>✔</span>` : ``}
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


    function allLessonsCompleted(modules) {
        if (!modules) return false;
        return modules.every(m => Array.isArray(m.lessons) && m.lessons.every(l => Number(l.completed) === 1));
    }

    async function checkCourseProgress(course, modules) {
        if (!finalTaskEl || !startTaskBtn || !taskDescEl) return;

        finalTaskEl.style.display = "block";

        const courseIsCompleted = course.completed || allLessonsCompleted(modules);

        if (!courseIsCompleted) {
            startTaskBtn.disabled = true;
            startTaskBtn.textContent = "Завершите курс";
            taskDescEl.textContent = "Завершите все уроки курса, чтобы открыть задание";
            return;
        }

        if (course.final_passed) {
            startTaskBtn.disabled = true;
            startTaskBtn.textContent = "Задание пройдено";
            taskDescEl.textContent = "Вы уже прошли итоговое задание";
            return;
        }

        startTaskBtn.disabled = false;
        startTaskBtn.textContent = "Пройти итоговое задание";

        await loadFinalTask(course.id);
    }




    async function loadFinalTask(courseId) {
        if (!finalTaskEl || !startTaskBtn || !taskDescEl) return;

        try {
            const res = await authFetch(`/api/course/${courseId}/task`);
            const data = await res.json();

            if (!data.success || !data.task) return;

            // Подставляем описание итогового задания
            taskDescEl.textContent = data.task.description || "Пройдите задание, чтобы получить результат";

            startTaskBtn.disabled = false;
            startTaskBtn.textContent = "Пройти итоговое задание";

            startTaskBtn.onclick = () => {
                window.location.href = `/finallytask.html?taskId=${data.task.id}`;
            };

        } catch (err) {
            console.error("❌ ошибка загрузки задания", err);
        }
    }

    function updateFinalTaskButton(course) {
        const startTaskBtn = document.getElementById("startTaskBtn");
        const taskDescription = document.getElementById("taskDescription");

        if (!startTaskBtn || !taskDescription) return;

        // Если курс завершён — активируем кнопку
        if (course.completed) {
            startTaskBtn.disabled = false;
            startTaskBtn.textContent = "Пройти итоговое задание";
            taskDescription.textContent = "Поздравляем! Курс завершён, можете пройти итоговое задание.";
        }
    }














});
