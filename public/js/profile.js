// js/profile.js
(() => {
    "use strict";

    // ===== helpers =====
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    async function safeJson(res) {
        try {
            return await res.json();
        } catch {
            return {};
        }
    }

    function formatDate(value) {
        if (!value) return "-";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // ===== toast =====
    const toastEl = $("#toast");
    const toastText = $("#toastText");
    const toastClose = $("#toastClose");
    let toastTimer = null;

    function showToast(message, type = "ok") {
        if (!toastEl || !toastText) return alert(message);

        toastEl.classList.toggle("toast--error", type === "error");
        toastText.textContent = message;
        toastEl.hidden = false;

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => (toastEl.hidden = true), 2500);
    }

    if (toastClose && toastEl) {
        toastClose.addEventListener("click", () => {
            toastEl.hidden = true;
            clearTimeout(toastTimer);
        });
    }

    // ===== page switcher (one-page app) =====
    const pageProfile = $("#pageProfile");
    const pageCourses = $("#pageCourses");

    const sidebarLinks = $$(".profile-sidebar__menu-link[data-page]");
    const mobileLinks = $$(".profile-mobile__link[data-page]");

    function setActiveLink(list, page) {
        list.forEach((a) => {
            const isSidebar = a.classList.contains("profile-sidebar__menu-link");
            const activeClass = isSidebar
                ? "profile-sidebar__menu-link--active"
                : "profile-mobile__link--active";
            a.classList.toggle(activeClass, a.getAttribute("data-page") === page);
        });
    }

    // ===== mobile drawer =====
    const mobileMenuBtn = $("#mobileMenuBtn");
    const mobileOverlay = $("#mobileOverlay");
    const mobileDrawer = $("#mobileDrawer");

    function closeDrawer() {
        if (!mobileOverlay || !mobileDrawer || !mobileMenuBtn) return;
        mobileOverlay.hidden = true;
        mobileDrawer.hidden = true;
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    function openDrawer() {
        if (!mobileOverlay || !mobileDrawer || !mobileMenuBtn) return;
        mobileOverlay.hidden = false;
        mobileDrawer.hidden = false;
        mobileMenuBtn.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
            const expanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
            expanded ? closeDrawer() : openDrawer();
        });
    }
    if (mobileOverlay) mobileOverlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());

    function openPage(page) {
        const isProfile = page !== "courses";
        const isCourses = page === "courses";

        if (pageProfile) {
            pageProfile.hidden = !isProfile;
            pageProfile.classList.toggle("page--active", isProfile);
        }
        if (pageCourses) {
            pageCourses.hidden = !isCourses;
            pageCourses.classList.toggle("page--active", isCourses);
        }

        setActiveLink(sidebarLinks, page);
        setActiveLink(mobileLinks, page);

        const hash = isCourses ? "#courses" : "#profile";
        if (location.hash !== hash) history.replaceState(null, "", hash);

        closeDrawer();
    }

    function initialPageFromHash() {
        const h = (location.hash || "").toLowerCase();
        return h.includes("courses") ? "courses" : "profile";
    }

    sidebarLinks.forEach((a) => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            openPage(a.getAttribute("data-page"));
        });
    });

    mobileLinks.forEach((a) => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            openPage(a.getAttribute("data-page"));
        });
    });

    // ===== buttons: home/back/logout =====
    const backBtn = $("#backBtn");
    const logoutBtn = $("#logoutBtn");
    const mobileHomeBtn = $("#mobileHomeBtn");
    const mobileLogoutBtn = $("#mobileLogoutBtn");

    if (backBtn) backBtn.addEventListener("click", () => (window.location.href = "/dashboard"));
    if (mobileHomeBtn) mobileHomeBtn.addEventListener("click", () => (window.location.href = "/"));

    async function doLogout() {
        try {
            const res = await fetch("/logout", { method: "POST", credentials: "include" });
            if (res.ok) return (window.location.href = "/");
        } catch {}
        window.location.href = "/";
    }

    if (logoutBtn) logoutBtn.addEventListener("click", doLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", doLogout);

    // ===== profile load/save/avatar =====
    const form = $("#profileForm");
    const avatarInput = $("#avatarInput");
    const avatarImg = $("#avatarImg");
    const sidebarLogin = $("#sidebarLogin");
    const mobileName = $("#mobileName");
    const mobileAvatar = $("#mobileAvatar");

    function applyAvatar(src) {
        if (!src) return;
        if (avatarImg) avatarImg.src = src;
        if (mobileAvatar) mobileAvatar.src = src;
    }

    function applyNameFromProfile(profile) {
        const first = (profile?.first_name || "").trim();
        const last = (profile?.last_name || "").trim();
        const full = [first, last].filter(Boolean).join(" ").trim();
        const display = full || "Пользователь";

        if (sidebarLogin) sidebarLogin.textContent = display;
        if (mobileName) mobileName.textContent = display;
    }

    async function loadProfile() {
        if (!form) return;

        try {
            const res = await fetch("/api/profile", { credentials: "include" });
            const data = await safeJson(res);

            if (data && data.profile) {
                const profile = data.profile;

                Object.keys(profile).forEach((key) => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (!field) return;
                    field.value = profile[key] || "";
                });

                applyNameFromProfile(profile);

                if (profile.avatar) applyAvatar(profile.avatar);
            } else {
                applyNameFromProfile(null);
            }
        } catch (e) {
            console.error("Ошибка загрузки профиля", e);
            showToast("Ошибка загрузки профиля", "error");
        }
    }

    async function saveProfile(payload) {
        const res = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        });
        return safeJson(res);
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            try {
                const result = await saveProfile(payload);
                if (result && result.success) {
                    showToast("Профиль сохранён");
                    applyNameFromProfile({ first_name: payload.first_name, last_name: payload.last_name });
                } else {
                    showToast("Ошибка сохранения", "error");
                }
            } catch (err) {
                console.error(err);
                showToast("Ошибка сохранения", "error");
            }
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener("change", async () => {
            const file = avatarInput.files && avatarInput.files[0];
            if (!file) return;

            const avatarData = new FormData();
            avatarData.append("avatar", file);

            try {
                const res = await fetch("/api/profile/avatar", {
                    method: "POST",
                    credentials: "include",
                    body: avatarData,
                });

                const result = await safeJson(res);

                if (result && result.success) {
                    const newAvatar = (result.avatar || "") + "?t=" + Date.now();
                    applyAvatar(newAvatar);
                    showToast("Аватар обновлён");
                } else {
                    showToast("Ошибка загрузки аватара", "error");
                }
            } catch (e) {
                console.error(e);
                showToast("Ошибка загрузки аватара", "error");
            } finally {
                avatarInput.value = "";
            }
        });
    }

    // ===== your level block (my-result + history) =====
    const testResultBlock = $("#testResultBlock");
    const testActions = $("#testActions");
    const historyBlock = $("#historyBlock");
    const levelBadge = $("#levelBadge");
    const retryTestBtn = $("#retryTestBtn");
    const historyBtn = $("#historyBtn");

    async function loadMyResult() {
        if (!testResultBlock) return;

        try {
            const res = await fetch("/api/my-result", { credentials: "include" });
            if (!res.ok) return;

            const data = await safeJson(res);

            if (!data || !data.success || !data.result) {
                testResultBlock.innerHTML = `
          <p style="color:var(--muted);margin:0;">
            Вы ещё не проходили тест.<br>
            <a href="/test.html"><b>Пройдите тест, чтобы узнать ваш уровень</b></a>
          </p>
        `;
                if (testActions) testActions.style.display = "none";
                if (levelBadge) levelBadge.textContent = "—";
                return;
            }

            const r = data.result;

            if (levelBadge) levelBadge.textContent = (r.level || "—").toUpperCase();

            const total = r.total_score ?? "-";
            const date = formatDate(r.created_at);

            testResultBlock.innerHTML = `
        <div style="
          padding:16px;
          border:1px solid rgba(37,99,235,.2);
          border-radius:16px;
          background:linear-gradient(135deg, rgba(37,99,235,.08), rgba(255,255,255,0));
        ">
          <div style="display:grid;gap:12px;grid-template-columns:1fr;">
            <div>
              <div style="font-size:12px;color:var(--muted);font-weight:700;">Уровень</div>
              <div style="font-size:22px;font-weight:800;color:var(--primary);">
                ${(r.level || "").toUpperCase()}
              </div>
            </div>
            <div>
              <div style="font-size:12px;color:var(--muted);font-weight:700;">Баллы</div>
              <div style="font-size:22px;font-weight:800;">${total}</div>
            </div>
            <div>
              <div style="font-size:12px;color:var(--muted);font-weight:700;">Дата</div>
              <div style="font-weight:800;">${date}</div>
            </div>
          </div>
        </div>
      `;

            if (testActions) testActions.style.display = "flex";
        } catch (e) {
            console.error("Ошибка загрузки результата", e);
        }
    }

    if (retryTestBtn) retryTestBtn.addEventListener("click", () => (window.location.href = "/test.html"));

    if (historyBtn) {
        historyBtn.addEventListener("click", async () => {
            if (!historyBlock) return;

            const isHidden = historyBlock.style.display === "none" || historyBlock.hidden;
            historyBlock.style.display = isHidden ? "block" : "none";
            if (!isHidden) return;

            try {
                const res = await fetch("/api/test-history", { credentials: "include" });
                const data = await safeJson(res);

                if (!data || !data.success) {
                    historyBlock.innerHTML = `<p style="color:var(--muted);margin:0;">История пока недоступна.</p>`;
                    return;
                }

                const items = data.results || [];
                if (!items.length) {
                    historyBlock.innerHTML = `<p style="color:var(--muted);margin:0;">История пуста.</p>`;
                    return;
                }

                historyBlock.innerHTML = items
                    .map((x) => {
                        const lvl = (x.level || "").toUpperCase();
                        const total = x.total_score ?? "-";
                        const date = formatDate(x.created_at);

                        return `
              <div class="history__row">
                <div class="history__left">
                  <div>
                    <div class="history__name">${lvl || "-"}</div>
                    <div class="history__date">${date}</div>
                  </div>
                </div>
                <div class="history__score">
                  ${total}
                  <span>баллы</span>
                </div>
              </div>
            `;
                    })
                    .join("");
            } catch (e) {
                console.error(e);
                historyBlock.innerHTML = `<p style="color:var(--muted);margin:0;">Ошибка загрузки истории.</p>`;
            }
        });
    }

    // ===== courses: everything from DB =====
    async function loadCourseBlocks() {
        const courseTitle = document.getElementById("courseTitle");
        const courseLevel = document.getElementById("courseLevel");
        const courseDesc = document.getElementById("courseDesc");

        const courseLessonsTotal = document.getElementById("courseLessonsTotal");
        const courseDuration = document.getElementById("courseDuration");
        const courseCompleted = document.getElementById("courseCompleted");

        const courseProgress = document.getElementById("courseProgress");
        const courseProgressBar = document.getElementById("courseProgressBar");
        const coursePercent = document.getElementById("coursePercent");
        const courseNextLesson = document.getElementById("courseNextLesson");

        const goCourseBtn = document.getElementById("goCourseBtn");

        const tileDone = document.getElementById("tileDone");
        const tileLeft = document.getElementById("tileLeft");

        const progressTitle = document.getElementById("progressTitle");
        const progressText = document.getElementById("progressText");

        // если ты где-то убрал элементы — просто выходим без ошибок
        if (!courseTitle && !courseLessonsTotal && !courseProgressBar) return;

        try {
            const res = await fetch("/api/lessons/progress/current", { credentials: "include" });
            if (!res.ok) return;

            const data = await safeJson(res);
            if (!data || !data.success || !data.course) return;

            const course = data.course;

            const totalLessons = Number(data.totalLessons || 0);
            const completedLessons = Number(data.completedLessons || 0);
            const modulesCount = Number(data.modulesCount || 0);
            const percent = Number(data.percent || 0);

            // ===== Заголовок курса =====
            if (courseTitle) courseTitle.textContent = course.title || "—";
            if (courseLevel) courseLevel.textContent = (course.level || "—").toUpperCase();

            // description у тебя в ответе сейчас нет (в courses таблице тоже не видно),
            // поэтому не ломаемся:
            if (courseDesc) courseDesc.textContent = courseDesc.textContent === "—" ? "—" : courseDesc.textContent;

            // ===== Статы карточки =====
            if (courseLessonsTotal) courseLessonsTotal.textContent = totalLessons ? String(totalLessons) : "0";
            if (courseDuration) courseDuration.textContent = modulesCount ? `${modulesCount} модулей` : "0 модулей";
            if (courseCompleted) courseCompleted.textContent = `${completedLessons}/${totalLessons || 0}`;

            // ===== Прогресс =====
            if (coursePercent) coursePercent.textContent = `${percent}%`;
            if (courseProgressBar) courseProgressBar.style.width = `${percent}%`;
            if (courseProgress) courseProgress.setAttribute("aria-valuenow", String(percent));

            // ===== Следующий урок =====
            if (courseNextLesson) {
                courseNextLesson.textContent = data.nextLesson
                    ? data.nextLesson.title
                    : "Курс завершён 🎉";
            }

            // ===== Тайлы "Ваш прогресс" =====
            if (tileDone) tileDone.textContent = String(completedLessons);
            if (tileLeft) tileLeft.textContent = String(Math.max(0, totalLessons - completedLessons));

            if (progressTitle) {
                progressTitle.textContent = totalLessons ? "Отличная работа!" : "Начните обучение";
            }
            if (progressText) {
                progressText.textContent = totalLessons
                    ? `Вы завершили ${completedLessons} уроков. Продолжайте в том же духе!`
                    : "Пройдите первый урок, чтобы увидеть прогресс.";
            }

            // ===== Кнопка перехода =====
            if (goCourseBtn && course.slug) {
                goCourseBtn.onclick = () => (window.location.href = `/courses/${course.slug}`);
            }
        } catch (e) {
            console.error("Ошибка загрузки прогресса курса", e);
        }
    }


    // ===== init =====
    document.addEventListener("DOMContentLoaded", async () => {
        openPage(initialPageFromHash());
        await loadProfile();
        await loadMyResult();
        await loadCourseBlocks();
    });

    window.addEventListener("hashchange", () => openPage(initialPageFromHash()));
})();
