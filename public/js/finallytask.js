console.log("finallytask.js загружен");

const params = new URLSearchParams(window.location.search);
const taskId = params.get("taskId");

const taskDescriptionEl = document.getElementById("taskDescription");
const questionsContainer = document.getElementById("questionsContainer");
const submitBtn = document.getElementById("submitTaskBtn");
const backBtn = document.getElementById("backBtn");
const resultMessage = document.getElementById("resultMessage");

if (!taskId) {
    taskDescriptionEl.textContent = "Задание не найдено";
    submitBtn.disabled = true;
} else {
    loadTask();
}


async function loadTask() {
    try {
        const res = await authFetch(`/api/task/${taskId}`);
        const data = await res.json();

        if (!data.success || !data.task) {
            taskDescriptionEl.textContent = "Задание не найдено";
            submitBtn.disabled = true;
            return;
        }

        taskDescriptionEl.textContent = data.task.description || "Описание задания отсутствует";

        await loadQuestions(taskId);

    } catch (err) {
        console.error(err);
        taskDescriptionEl.textContent = "Ошибка загрузки задания";
        submitBtn.disabled = true;
    }
}

async function loadQuestions(taskId) {
    try {
        const res = await authFetch(`/api/task/${taskId}/questions`);
        const data = await res.json();

        if (!data.success || !data.questions || data.questions.length === 0) {
            questionsContainer.innerHTML = "<p>Вопросы не найдены</p>";
            submitBtn.disabled = true;
            return;
        }

        questionsContainer.innerHTML = "";

        data.questions.forEach((q, i) => {
            const div = document.createElement("div");
            div.className = "question";

            let options = [];


            if (Array.isArray(q.options)) {
                options = q.options;
            }

            else if (typeof q.options === "string") {
                try {
                    options = JSON.parse(q.options);

                    if (!Array.isArray(options)) options = q.options.split(",");
                } catch {
                    options = q.options.split(",");
                }
            }


            options = options.map(o => o.trim());

            div.innerHTML = `
                <p>${i + 1}. ${q.question}</p>
                ${options.map(o => `
                    <label>
                        <input type="radio" name="q${q.id}" value="${o}">
                        ${o}
                    </label>
                `).join("")}
            `;
            questionsContainer.appendChild(div);
        });

        submitBtn.disabled = false;

    } catch (err) {
        console.error(err);
        questionsContainer.innerHTML = "<p>Ошибка загрузки вопросов</p>";
        submitBtn.disabled = true;
    }
}


submitBtn.addEventListener("click", async () => {
    const answers = [];

    document.querySelectorAll(".question").forEach(qEl => {
        const input = qEl.querySelector("input:checked");
        if (input) answers.push({ questionId: input.name.slice(1), answer: input.value });
    });

    if (answers.length === 0) {
        alert("Выберите хотя бы один ответ");
        return;
    }

    try {

        const res = await authFetch(`/api/task/${taskId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: 100 })
        });

        const data = await res.json();

        resultMessage.classList.remove("hidden");

        if (data.success && data.passed) {
            resultMessage.textContent = "Поздравляем! Вы прошли задание 🎉";
            resultMessage.style.color = "green";
            submitBtn.disabled = true;
        } else {
            resultMessage.textContent = "Задание не пройдено. Попробуйте снова.";
            resultMessage.style.color = "red";
        }

    } catch (err) {
        console.error(err);
        resultMessage.classList.remove("hidden");
        resultMessage.textContent = "Ошибка отправки задания";
        resultMessage.style.color = "red";
    }
});


backBtn.addEventListener("click", () => {
    window.history.back();
});
