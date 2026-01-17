document.addEventListener("DOMContentLoaded", loadCourse);

async function loadCourse() {
    const slug = window.location.pathname.split("/").pop();

    try {
        const res = await authFetch(`/api/course/${slug}`);
        const data = await res.json();
        renderModules(data.modules);
    } catch (err) {
        console.error("Ошибка загрузки курса:", err);
        alert("Не удалось загрузить курс");
    }
}


function renderModules(modules) {
    const container = document.getElementById("modules");
    container.innerHTML = "";

    modules.forEach((module, index) => {
        const section = document.createElement("section");
        section.className = "module";

        const locked = module.locked;

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
                        ${locked ? "locked" : ""}">
                        <div>
                            <strong>${lesson.title}</strong>
                            <p>${lesson.completed ? "Урок пройден" : "Урок не пройден"}</p>
                        </div>

                        ${
            lesson.completed
                ? `<span class="progress">✔</span>`
                : locked
                    ? `<span class="progress">🔒</span>`
                    : `<button onclick="openLesson(${lesson.id})">
                                            Открыть
                                       </button>`
        }
                    </div>
                `).join("")}
            </div>
        `;

        container.appendChild(section);
    });
}

/* ================== OPEN LESSON ================== */
function openLesson(lessonId) {
    window.location.href = `/lesson.html?id=${lessonId}`;
}
