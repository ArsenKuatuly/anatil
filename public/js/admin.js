const content = document.getElementById("content");
const buttons = document.querySelectorAll("[data-tab]");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        loadTab(btn.dataset.tab);
    });
});

loadTab("users");

/* ================= TAB ROUTER ================= */

function loadTab(tab) {
    if (tab === "users") loadUsers();
    if (tab === "courses") loadCourses();
    if (tab === "tasks") loadTasks();
    if (tab === "stats") loadStats();
}

async function loadTasks() {
    const res = await fetch("/api/admin/tasks");
    const data = await res.json();

    content.innerHTML = `
        <div class="admin-card">
            <h3>Задания</h3>
            <ul class="admin-list">
                ${data.tasks.map(t => `
                    <li>
                        <strong>${t.title}</strong> (Курс: ${t.courseTitle}, ID: ${t.id})
                        <button class="admin-btn admin-btn--primary"
                            onclick="editTask(${t.id})">
                            Редактировать
                        </button>
                    </li>
                `).join("")}
            </ul>
        </div>
    `;
}

async function editTask(taskId) {
    const res = await fetch(`/api/task/${taskId}`);
    const data = await res.json();

    if (!data.success) return alert("Задание не найдено");

    const task = data.task;

    content.innerHTML = `
        <div class="admin-card">
            <button class="admin-back" onclick="loadTasks()">← Назад</button>
            <h3>Редактировать задание</h3>

            <label>Название</label>
            <input id="taskTitle" value="${escapeHtml(task.title)}">

            <label>Описание</label>
            <textarea id="taskDesc">${escapeHtml(task.description)}</textarea>

            <label>Проходной балл</label>
            <input id="taskScore" type="number" value="${task.pass_score}">

            <button class="admin-btn admin-btn--primary"
                    onclick="saveTask(${task.id})">💾 Сохранить</button>
        </div>
    `;
}

async function saveTask(taskId) {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const pass_score = parseInt(document.getElementById("taskScore").value);

    await fetch(`/api/task/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, pass_score })
    });

    alert("Задание сохранено");
    loadTasks();
}

async function editTask(taskId) {
    const res = await fetch(`/api/task/${taskId}`);
    const data = await res.json();

    if (!data.success) return alert("Задание не найдено");

    const task = data.task;

    // Получаем вопросы
    const questionsRes = await fetch(`/api/task/${taskId}/questions`);
    const questionsData = await questionsRes.json();

    const questions = questionsData.questions || [];

    content.innerHTML = `
        <div class="admin-card">
            <button class="admin-back" onclick="loadTasks()">← Назад</button>
            <h3>Редактировать задание</h3>

            <label>Название</label>
            <input id="taskTitle" value="${escapeHtml(task.title)}">

            <label>Описание</label>
            <textarea id="taskDesc">${escapeHtml(task.description)}</textarea>

            <label>Проходной балл</label>
            <input id="taskScore" type="number" value="${task.pass_score}">

            <h4>Вопросы</h4>
            <div id="taskQuestions">
                ${questions.map(q => `
                    <div class="lesson-editor" id="question-${q.id}">
                        <label>Вопрос</label>
                        <input value="${escapeHtml(q.question)}" class="questionText">

                        <label>Варианты (JSON)</label>
                        <textarea class="questionOptions">${escapeHtml(q.options)}</textarea>

                        <button class="admin-btn admin-btn--primary"
                            onclick="saveQuestion(${q.id})">
                            💾 Сохранить вопрос
                        </button>
                    </div>
                `).join("")}
            </div>

            <button class="admin-btn admin-btn--primary"
                    onclick="saveTask(${task.id})">💾 Сохранить задание</button>
        </div>
    `;
}

async function saveQuestion(questionId) {
    const container = document.getElementById(`question-${questionId}`);
    const questionText = container.querySelector(".questionText").value;
    const options = container.querySelector(".questionOptions").value;

    try {
        await fetch(`/api/task-question/${questionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: questionText,
                options: options
            })
        });

        alert("Вопрос сохранён");
    } catch (err) {
        console.error(err);
        alert("Ошибка при сохранении вопроса");
    }
}




async function saveTask(taskId) {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const pass_score = parseInt(document.getElementById("taskScore").value);

    await fetch(`/api/admin/task/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, pass_score })
    });

    alert("Задание сохранено");
    loadTasks();
}


/* ================= USERS ================= */

async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();

    content.innerHTML = `
        <div class="admin-card">
            <h3>Пользователи</h3>
            <table class="admin-table">
                <tr>
                    <th>ID</th>
                    <th>Login</th>
                    <th>Role</th>
                    <th>Level</th>
                    <th>Actions</th>
                </tr>
                ${data.users.map(u => `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.login}</td>
                        <td>
                            <select onchange="changeRole(${u.id}, this.value)">
                                <option value="user" ${u.role === "user" ? "selected" : ""}>user</option>
                                <option value="admin" ${u.role === "admin" ? "selected" : ""}>admin</option>
                            </select>
                        </td>
                        <td>${u.current_level || "-"}</td>
                        <td>
                            <button class="admin-btn admin-btn--danger"
                                onclick="resetUser(${u.id})">
                                Сброс
                            </button>
                        </td>
                    </tr>
                `).join("")}
            </table>
        </div>
    `;
}

async function changeRole(id, role) {
    await fetch(`/api/admin/user/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
    });
}

async function resetUser(id) {
    if (!confirm("Сбросить прогресс пользователя?")) return;
    await fetch(`/api/admin/user/${id}/reset`, { method: "POST" });
    alert("Прогресс сброшен");
}

/* ================= COURSES → MODULES → LESSONS ================= */

async function loadCourses() {
    const res = await fetch("/api/admin/courses");
    const data = await res.json();

    content.innerHTML = `
        <div class="admin-card">
            <h3>Курсы</h3>
            <ul class="admin-list">
                ${data.courses.map(c => `
                    <li>
                        <button class="admin-link"
                            onclick="loadModules(${c.id})">
                            ${c.title} <small>(${c.level})</small>
                        </button>
                    </li>
                `).join("")}
            </ul>
        </div>
    `;
}

async function loadModules(courseId) {
    const res = await fetch(`/api/admin/modules/${courseId}`);
    const modules = await res.json();

    content.innerHTML = `
        <div class="admin-card">
            <button class="admin-back" onclick="loadCourses()">← Курсы</button>
            <h3>Модули</h3>
            <ul class="admin-list">
                ${modules.map(m => `
                    <li>
                        <button class="admin-link"
                            onclick="loadLessons(${m.id})">
                            ${m.title}
                        </button>
                    </li>
                `).join("")}
            </ul>
        </div>
    `;
}

async function loadLessons(moduleId) {
    const res = await fetch(`/api/admin/lessons/${moduleId}`);
    const lessons = await res.json();

    content.innerHTML = `
        <div class="admin-card">
            <button class="admin-back" onclick="history.back()">← Назад</button>
            <h3>Уроки</h3>

            ${lessons.map(l => `
                <div class="lesson-editor">
                    <label>Название урока</label>
                    <input id="title-${l.id}" value="${escapeHtml(l.title)}">

                    <label>Контент урока</label>
                    <textarea id="content-${l.id}">${escapeHtml(l.content || "")}</textarea>

                    <button class="admin-btn"
                        onclick="saveLesson(${l.id})">
                        💾 Сохранить
                    </button>
                </div>
            `).join("")}
        </div>
    `;
}

async function saveLesson(id) {
    const title = document.getElementById(`title-${id}`).value;
    const contentText = document.getElementById(`content-${id}`).value;

    await fetch(`/api/admin/lesson/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            content: contentText
        })
    });

    alert("Урок сохранён");
}

/* ================= STATS ================= */

async function loadStats() {
    const res = await fetch("/api/admin/stats");
    const { stats } = await res.json();

    content.innerHTML = `
        <div class="admin-card">
            <h3>Статистика</h3>
            <p>👤 Пользователи: <b>${stats.users}</b></p>
            <p>🛡 Админы: <b>${stats.admins}</b></p>
            <p>📝 Тестов пройдено: <b>${stats.tests}</b></p>
        </div>
    `;
}

/* ================= HELPERS ================= */

function escapeHtml(text) {
    if (text === null || text === undefined) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

