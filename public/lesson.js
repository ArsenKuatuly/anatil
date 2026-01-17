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

        modal.classList.remove("hidden");

        /* ================== КУРС ЗАВЕРШЁН ================== */
        if (data.courseCompleted) {
            modalTitle.textContent = "Поздравляем! 🎉";
            modalText.textContent = "Вы прошли все уроки. Чтобы пройти на следующий курс, пройдите итоговое задание.";

            // Кнопка "К курсу"
            goCourseBtn.style.display = "inline-block";
            goCourseBtn.disabled = false;
            goCourseBtn.textContent = "К курсу";
            goCourseBtn.addEventListener("click", () => {
                window.location.href = `/courses/${courseSlug}`;
            });

            // Кнопка "Итоговое задание"
            goNextBtn.style.display = "inline-block";
            goNextBtn.disabled = true; // пока не получен taskId
            goNextBtn.textContent = "Итоговое задание";

            try {
                const courseId = data.courseId;
                if (courseId) {
                    const taskRes = await authFetch(`/api/course/${courseId}/task`);
                    const taskData = await taskRes.json();

                    console.log("taskData:", taskData);

                    if (taskData.success && taskData.task && taskData.task.id) {
                        const taskId = taskData.task.id;

                        goNextBtn.disabled = false;

                        // Снимаем старые обработчики
                        const newBtn = goNextBtn.cloneNode(true);
                        goNextBtn.replaceWith(newBtn);

                        // Навешиваем новый обработчик
                        newBtn.addEventListener("click", () => {
                            window.location.href = `/finallytask.html?taskId=${taskId}`;
                        });
                    }
                }
            } catch (err) {
                console.error("Ошибка получения итогового задания", err);
                goNextBtn.disabled = true;
            }
            goNextBtn.disabled = true;
            }

            /* ================== УРОК / МОДУЛЬ ================== */
        modalTitle.textContent = data.moduleCompleted ? "Модуль завершён 🏆" : "Урок завершён 🎉";
        modalText.textContent = data.moduleCompleted ? "Открыт следующий модуль" : "Перейти к следующему уроку?";

        /* ================== СЛЕДУЮЩИЙ УРОК ================== */
        const nextRes = await authFetch("/api/continue-lesson");
        const nextData = await nextRes.json();

        if (nextData.success && nextData.lessonId) {
            goNextBtn.style.display = "inline-block";
            goNextBtn.disabled = false;
            goNextBtn.textContent = "Следующий урок";
            goNextBtn.addEventListener("click", () => {
                window.location.href = `/lesson.html?id=${nextData.lessonId}`;
            });
        } else {
            goNextBtn.style.display = "none";
        }

        goCourseBtn.textContent = "К курсу";
        goCourseBtn.addEventListener("click", () => {
            window.location.href = `/courses/${courseSlug}`;
        });

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
