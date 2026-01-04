document.addEventListener("DOMContentLoaded", loadCourse);

async function loadCourse() {
    const res = await fetch("/api/course/basic", {
        credentials: "include"
    });

    if (!res.ok) {
        alert("Не удалось загрузить курс");
        return;
    }

    const data = await res.json();
    renderModules(data.modules);
}

function renderModules(modules) {
    const container = document.getElementById("modules");
    container.innerHTML = "";

    modules.forEach((module, index) => {
        const section = document.createElement("section");
        section.className = "module";

        const locked = module.locked;
        const completed = module.completed;

        section.innerHTML = `
            <div class="module-header ${locked ? "locked" : ""}">
                <span class="lock">${locked ? "🔒" : "🔓"}</span>
                <div>
                    <h2>Модуль #${index + 1}: ${module.title}</h2>
                    <span class="status ${locked ? "locked" : ""}">
                        ${locked ? "Модуль заблокирован" : "Модуль доступен"}
                    </span>
                </div>
            </div>

            <div class="lessons ${locked ? "" : "active"}">
                ${module.lessons.map(lesson => `
                    <div class="lesson
                        ${lesson.completed ? "completed" : ""}
                        ${locked ? "locked" : ""}"
                        data-lesson="${lesson.id}">
                        <div>
                            <strong>${lesson.title}</strong>
                            <p>${lesson.completed ? "Урок пройден" : "Урок не пройден"}</p>
                        </div>
                        ${
            lesson.completed
                ? `<span class="progress">1/1</span>`
                : `<button onclick="completeLesson(${lesson.id})">
                                        Завершить
                                   </button>`
        }
                    </div>
                `).join("")}
            </div>
        `;

        container.appendChild(section);
    });
}
async function completeLesson(lessonId) {
    const res = await fetch("/api/lesson/complete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ lessonId })
    });

    const data = await res.json();

    if (!data.success) {
        alert("Не удалось завершить урок");
        return;
    }

    // перезагружаем курс — модуль может открыться
    loadCourse();
}
