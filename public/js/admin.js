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
    if (tab === "stats") loadStats();
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
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
