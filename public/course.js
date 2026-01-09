console.log("course.js загружен");

/* ================== ПРОВЕРКА СТРАНИЦЫ ================== */
document.addEventListener("DOMContentLoaded", async () => {
    const titleEl = document.getElementById("courseTitle");
    const modulesEl = document.getElementById("modules");

    // если JS подключён не там — выходим
    if (!titleEl || !modulesEl) {
        console.warn("course.js загружен не на странице курса");
        return;
    }

    /* ================== SLUG ИЗ URL ================== */
    const parts = window.location.pathname.split("/");
    const slug = parts[parts.length - 1];

    if (!slug) {
        titleEl.textContent = "Курс не найден";
        return;
    }

    /* ================== ЗАГРУЗКА КУРСА ================== */
    try {
        const res = await authFetch(`/api/course/${slug}`);

        if (!res || !res.ok) {
            throw new Error("Ошибка загрузки курса");
        }

        const data = await res.json();

        if (!data.success) {
            titleEl.textContent = "Курс недоступен";
            return;
        }

        renderCourse(data.course, data.modules);

    } catch (err) {
        console.error("❌ Ошибка загрузки курса:", err);
        titleEl.textContent = "Ошибка загрузки курса";
    }
});

/* ================== RENDER ================== */
function renderCourse(course, modules) {
    const titleEl = document.getElementById("courseTitle");
    const modulesEl = document.getElementById("modules");

    titleEl.textContent = course.title;
    modulesEl.innerHTML = "";

    if (!modules || modules.length === 0) {
        modulesEl.innerHTML = "<p>В курсе пока нет модулей</p>";
        return;
    }

    modules.forEach(module => {
        const moduleDiv = document.createElement("div");
        moduleDiv.className = "module";

        const moduleTitle = document.createElement("h3");
        moduleTitle.textContent = module.title;

        if (module.locked) {
            moduleTitle.classList.add("locked");
            moduleTitle.textContent += " 🔒";
        }

        moduleDiv.appendChild(moduleTitle);

        /* ===== УРОКИ ===== */
        const lessonsList = document.createElement("ul");

        module.lessons.forEach(lesson => {
            const li = document.createElement("li");

            li.textContent = lesson.title;

            if (lesson.completed) {
                li.classList.add("completed");
                li.textContent += " ✅";
            }

            if (!module.locked) {
                li.style.cursor = "pointer";
                li.addEventListener("click", () => {
                    window.location.href = `/lesson.html?id=${lesson.id}`;
                });
            } else {
                li.classList.add("locked");
            }

            lessonsList.appendChild(li);
        });

        moduleDiv.appendChild(lessonsList);
        modulesEl.appendChild(moduleDiv);
    });
}
