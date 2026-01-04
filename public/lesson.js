/* ================== PARAMS ================== */
const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");
let courseSlug = null;


if (!lessonId) {
    alert("Урок не найден");
    window.location.href = "/dashboard.html";
}

/* ================== ELEMENTS ================== */
const lessonTitle = document.getElementById("lessonTitle");
const lessonContent = document.getElementById("lessonContent");
const completeBtn = document.getElementById("completeLessonBtn");
const backBtn = document.getElementById("backBtn");

/* ================== MODAL ================== */
const modal = document.getElementById("completionModal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const goCourseBtn = document.getElementById("goCourseBtn");
const goNextBtn = document.getElementById("goNextBtn");

/* ================== LOAD LESSON ================== */
async function loadLesson() {
    try {
        const res = await authFetch(`/api/lesson/${lessonId}`);
        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Нет доступа к уроку");
            window.location.href = "/dashboard.html";
            return;
        }

        lessonTitle.textContent = data.lesson.title;
        lessonContent.innerHTML = data.lesson.content;
        courseSlug = data.lesson.courseSlug;


    } catch (err) {
        console.error(err);
        alert("Ошибка загрузки урока");
    }
}

loadLesson();

/* ================== COMPLETE LESSON ================== */
completeBtn.addEventListener("click", async () => {
    try {
        /* ===== 1️⃣ ЗАВЕРШАЕМ УРОК ===== */
        const res = await authFetch("/api/lesson/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId })
        });

        const data = await res.json();

        if (!data.success) {
            alert("Ошибка завершения урока");
            return;
        }

        /* ================== КУРС ЗАВЕРШЁН ================== */
        if (data.courseCompleted) {
            modalTitle.textContent = "Курс завершён 🎓";

            if (data.nextCourse) {
                modalText.textContent = `Следующий курс: «${data.nextCourse.title}»`;
                goNextBtn.style.display = "block";
                goNextBtn.textContent = "Перейти к следующему курсу";

                goNextBtn.onclick = () => {
                    window.location.href = `/courses/${data.nextCourse.slug}`;
                };
            } else {
                modalText.textContent = "Поздравляем! Вы прошли все курсы 🎉";
                goNextBtn.style.display = "none";
            }

            goCourseBtn.textContent = "На главную";
            goCourseBtn.onclick = () => {
                if (courseSlug) {
                    window.location.href = `/courses/${courseSlug}`;
                } else {
                    window.location.href = "/dashboard.html";
                }
            };


            modal.classList.remove("hidden");
            return;
        }

        /* ================== УРОК / МОДУЛЬ ================== */
        modalTitle.textContent = data.moduleCompleted
            ? "Модуль завершён 🏆"
            : "Урок завершён 🎉";

        modalText.textContent = data.moduleCompleted
            ? "Открыт следующий модуль"
            : "Перейти к следующему уроку?";

        /* ===== 2️⃣ СЛЕДУЮЩИЙ УРОК ===== */
        const nextRes = await authFetch("/api/continue-lesson");
        const nextData = await nextRes.json();

        if (nextData.success) {
            goNextBtn.style.display = "block";
            goNextBtn.textContent = "Следующий урок";
            goNextBtn.onclick = () => {
                window.location.href = `/lesson.html?id=${nextData.lessonId}`;
            };
        } else {
            goNextBtn.style.display = "none";
        }

        goCourseBtn.textContent = "К курсу";
        goCourseBtn.onclick = () => {
            window.location.href = "/dashboard.html";
        };

        modal.classList.remove("hidden");

    } catch (err) {
        console.error(err);
        alert("Ошибка завершения урока");
    }
});

/* ================== BACK ================== */
backBtn.addEventListener("click", () => {
    if (courseSlug) {
        window.location.href = `/courses/${courseSlug}`;
    } else {
        window.location.href = "/dashboard.html";
    }
});

