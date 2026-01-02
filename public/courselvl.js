

const moduleHeaders = document.querySelectorAll('.module-header');

moduleHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const lessons = header.nextElementSibling;
        lessons.classList.toggle('active');
    });
});

async function loadCourse() {
    const res = await authFetch("/api/course/elementary");
    const data = await res.json();

    if (!data.success) return;

    const container = document.querySelector(".course");

    data.modules.forEach(module => {
        const section = document.createElement("section");
        section.className = "module";

        section.innerHTML = `
            <div class="module-header">
                <h2>${module.title}</h2>
            </div>
            <div class="lessons active"></div>
        `;

        const lessonsDiv = section.querySelector(".lessons");

        module.lessons.forEach(lesson => {
            const lessonDiv = document.createElement("div");
            lessonDiv.className = "lesson " + (lesson.completed ? "completed" : "");

            lessonDiv.innerHTML = `
                <div>
                    <strong>${lesson.title}</strong>
                    <p>${lesson.completed ? "Урок пройден" : "Не пройден"}</p>
                </div>
                <button data-id="${lesson.id}">
                    ${lesson.completed ? "✔" : "Пройти"}
                </button>
            `;

            lessonDiv.querySelector("button").onclick = () =>
                completeLesson(lesson.id);

            lessonsDiv.appendChild(lessonDiv);
        });

        container.appendChild(section);
    });
}

async function completeLesson(lessonId) {
    await authFetch("/api/lesson/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId })
    });

    location.reload();
}

loadCourse();
