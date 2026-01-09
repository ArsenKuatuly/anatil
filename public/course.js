document.addEventListener("DOMContentLoaded", async () => {
    try {
        // /courses/kazakh-elementary
        const slug = location.pathname.split("/").pop();

        const res = await authFetch(`/api/course/${slug}`);
        const data = await res.json();

        if (!data.success) {
            document.getElementById("modules").innerHTML =
                "<p>Курс недоступен</p>";
            return;
        }

        // 🔥 курс
        document.getElementById("courseTitle").textContent = data.course.title;

        const modulesContainer = document.getElementById("modules");
        modulesContainer.innerHTML = "";

        // 🔥 модули
        data.modules.forEach(module => {
            const moduleEl = document.createElement("div");
            moduleEl.className = "module";

            moduleEl.innerHTML = `
                <h3 class="module-title">
                    ${module.title}
                    ${module.completed ? "✅" : module.locked ? "🔒" : ""}
                </h3>

                <div class="lessons"></div>
            `;

            const lessonsContainer =
                moduleEl.querySelector(".lessons");

            module.lessons.forEach(lesson => {
                const lessonEl = document.createElement("div");
                lessonEl.className =
                    "lesson " +
                    (lesson.completed ? "lesson--done" : "");

                lessonEl.innerHTML = `
                    <span>${lesson.title}</span>
                    ${
                    !lesson.completed
                        ? `<a href="/lesson.html?id=${lesson.id}">
                                   Открыть →
                               </a>`
                        : ""
                }
                `;

                lessonsContainer.appendChild(lessonEl);
            });

            modulesContainer.appendChild(moduleEl);
        });

    } catch (err) {
        console.error("Ошибка загрузки курса", err);
    }
});
