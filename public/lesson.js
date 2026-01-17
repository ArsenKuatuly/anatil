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

completeBtn.addEventListener("click", async () => {
    try {
        completeBtn.disabled = true;

        const res = await authFetch("/api/lesson/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId })
        });

        const data = await res.json();

        if (!data.success) {
            alert("Ошибка завершения урока");
            completeBtn.disabled = false;
            return;
        }

        /* ================== КУРС ЗАВЕРШЁН ================== */
        if (data.courseCompleted) {

            modalTitle.textContent = "Поздравляем! 🎉";

            // Текст для всех курсов пройдено
            modalText.textContent = "Вы прошли все уроки. Чтобы пройти на следующий курс, пройдите итоговое задание.";

            // Кнопка "К курсу"
            goCourseBtn.style.display = "inline-block";
            goCourseBtn.textContent = "К курсу";
            goCourseBtn.onclick = () => {
                window.location.href = `/courses/${courseSlug}`;
            };

            // Кнопка "Итоговое задание"
            goNextBtn.style.display = "inline-block";
            goNextBtn.textContent = "Итоговое задание";

            // Берём id финального задания через API
            const taskRes = await authFetch(`/api/course/${data.courseId}/task`);
            const taskData = await taskRes.json();

            if (taskData.success && taskData.task) {
                goNextBtn.onclick = () => {
                    window.location.href = `/task.html?taskId=${taskData.task.id}`;
                };
            } else {
                goNextBtn.disabled = true;
            }

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

        /* ================== СЛЕДУЮЩИЙ УРОК ================== */
        const nextRes = await authFetch("/api/continue-lesson");
        const nextData = await nextRes.json();

        if (nextData.success && nextData.lessonId) {
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
            window.location.href = `/courses/${courseSlug}`;
        };

        modal.classList.remove("hidden");

    } catch (err) {
        console.error(err);
        alert("Ошибка завершения урока");
        completeBtn.disabled = false;
    }
});


/* ================== BACK ================== */
backBtn.addEventListener("click", () => {
    window.location.href = courseSlug
        ? `/courses/${courseSlug}`
        : "/dashboard.html";
});
