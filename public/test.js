const exam = document.querySelector(".exam");

const questionEl = exam.querySelector("#question");
const answersEl = exam.querySelector("#answers");
const currentEl = exam.querySelector("#current");
const progressEl = exam.querySelector("#progress");
const nextBtn = exam.querySelector("#nextBtn");
const timerEl = exam.querySelector("#timer");
const subjectBtns = exam.querySelectorAll(".exam__subject");

/* ================= ДАННЫЕ ================= */

const subjects = {
    math: {
        title: "Перевод слов",
        questions : [
            {
                question: "Как переводится слово «Сәлем»?",
                answers: ["Привет", "Пока", "Спасибо"],
                correct: 0
            },
            {
                question: "Как сказать «Спасибо»?",
                answers: ["Рахмет", "Сау бол", "Иә"],
                correct: 0
            },
            {
                question: "Как переводится слово «Иә»?",
                answers: ["Да", "Нет", "Пожалуйста"],
                correct: 0
            },
            {
                question: "Как сказать «До свидания»?",
                answers: ["Сау бол", "Сәлем", "Рахмет"],
                correct: 0
            },
            {
                question: "Как переводится «Қалайсың?»",
                answers: ["Как дела?", "Где ты?", "Кто ты?"],
                correct: 0
            },
            {
                question: "Как сказать «Меня зовут…»?",
                answers: ["Менің атым...", "Мен бармын", "Мен жақсы"],
                correct: 0
            },
            {
                question: "Как переводится «Қайда?»",
                answers: ["Где?", "Когда?", "Почему?"],
                correct: 0
            },
            {
                question: "Как переводится «Жақсы»?",
                answers: ["Хорошо", "Плохо", "Медленно"],
                correct: 0
            },
            {
                question: "Как сказать «Я понял»?",
                answers: ["Мен түсіндім", "Мен білмеймін", "Мен барамын"],
                correct: 0
            },
            {
                question: "Как переводится «Кітап»?",
                answers: ["Книга", "Ручка", "Дом"],
                correct: 0
            }
        ]
    },

    reading: {
        title: "Грамотность",
        questions: [
            {
                question: "Что является синонимом слова «быстро»?",
                answers: ["Медленно", "Скоро", "Тихо"],
                correct: 1
            },
            {
                question: "Какое слово лишнее?",
                answers: ["Книга", "Тетрадь", "Бежать"],
                correct: 2
            }
        ]
    },

    listening: {
        title: "Слушание",
        questions: [
            {
                question: "Какое слово ты услышал: «Сәлем»?",
                answers: ["Прощание", "Приветствие", "Извинение"],
                correct: 1
            },
            {
                question: "Что означает «Рахмет»?",
                answers: ["Здравствуйте", "Спасибо", "Пока"],
                correct: 1
            }
        ]
    }
};

/* ================= СОСТОЯНИЕ ================= */

let currentSubject = "math";

const examState = {
    math: {
        index: 0,
        score: 0,
        answers: []
    },
    reading: {
        index: 0,
        score: 0,
        answers: []
    },
    listening: {
        index: 0,
        score: 0,
        answers: []
    }
};


const subjectOrder  = ["math", "reading", "listening"];
let currentSubjectIndex = 0;
/* ================= ФУНКЦИИ ================= */

function renderQuestion() {

    currentSubjectIndex = subjectOrder.indexOf(currentSubject);

    const state = examState[currentSubject];
    const q = subjects[currentSubject].questions[state.index];

    questionEl.textContent = q.question;
    currentEl.textContent = state.index + 1;
    progressEl.textContent =
        `${state.index + 1} / ${subjects[currentSubject].questions.length}`;

    answersEl.innerHTML = "";
    nextBtn.disabled = true;

    q.answers.forEach((text, i) => {
        const label = document.createElement("label");
        label.className = "exam__answer";

        label.innerHTML = `
            <input type="radio" name="answer" value="${i}">
            <span>${text}</span>
        `;

        const input = label.querySelector("input");

        // ♻ восстановление выбранного ответа
        if (state.answers[state.index] === i) {
            input.checked = true;
            nextBtn.disabled = false;
        }

        input.addEventListener("change", () => {
            state.answers[state.index] = i;
            nextBtn.disabled = false;
        });

        answersEl.appendChild(label);
    });
}


const EXAM_DURATION = 40 * 60; // 40 минут в секундах
const TIMER_KEY = "examEndTime";

function initTimer() {
    let endTime = localStorage.getItem(TIMER_KEY);

    if (!endTime) {
        endTime = Date.now() + EXAM_DURATION * 1000;
        localStorage.setItem(TIMER_KEY, endTime);
    }

    return Number(endTime);
}
let examEndTime = initTimer();

const timerInterval = setInterval(() => {
    const remaining = Math.floor((examEndTime - Date.now()) / 1000);

    if (remaining <= 0) {
        clearInterval(timerInterval);

        // ✅ удаляем таймер ТОЛЬКО при завершении экзамена
        localStorage.removeItem(TIMER_KEY);

        timerEl.textContent = "00:00";
        finishExam();
        return;
    }

    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;

    timerEl.textContent =
        `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}, 1000);

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        console.warn("Пользователь покинул страницу");
    }
});



/* ================= СОБЫТИЯ ================= */


nextBtn.addEventListener("click", () => {
    const state = examState[currentSubject];
    const totalQuestions = subjects[currentSubject].questions.length;

    if (state.index < totalQuestions - 1) {
        state.index++;
        renderQuestion();
    } else {
        // 🔥 последний вопрос → следующий предмет
        goToNextSubject();
    }
});





subjectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        currentSubject = btn.dataset.subject;

        subjectBtns.forEach(b =>
            b.classList.toggle(
                "exam__subject--active",
                b.dataset.subject === currentSubject
            )
        );

        renderQuestion();
    });
});





/* ================= СТАРТ ================= */

renderQuestion();




const finishBtn = document.querySelector(".exam__finish");
if (finishBtn) {
    finishBtn.addEventListener("click", finishExam);
}


function finishExam() {
    clearInterval(timerInterval);
    localStorage.removeItem(TIMER_KEY);

    calculateScores();

    const totalScore =
        examState.math.score +
        examState.reading.score +
        examState.listening.score;

    const level = getLevel(totalScore);

    showResult(totalScore, level);
    saveResult(totalScore, level);
}



function getLevel(score) {
    if (score <= 6) return "Элементарный";
    if (score <= 12) return "Базовый";
    if (score <= 18) return "Средний";
    if (score <= 24) return "Выше среднего";
    return "Высокий";
}
function showResult(score, level) {
    exam.innerHTML = `
        <div class="exam__card">
            <h2>Результаты тестирования</h2>

            <p><b>Общий балл:</b> ${score} / 30</p>
            <p><b>Уровень:</b> ${level}</p>

            <hr>

            <p>Математическая грамотность: ${examState.math.score} / 10</p>
            <p>Грамотность чтения: ${examState.reading.score} / 10</p>
            <p>Слушание: ${examState.listening.score} / 10</p>
        </div>
    `;
}

function saveResult(score, level) {
    fetch("/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            totalScore: score,
            level,
            math: examState.math.score,
            reading: examState.reading.score,
            listening: examState.listening.score
        })
    });
}

function calculateScores() {
    Object.keys(examState).forEach(subject => {
        const state = examState[subject];

        state.score = state.answers.reduce((sum, ans, i) => {
            return sum +
                (ans === subjects[subject].questions[i]?.correct ? 1 : 0);
        }, 0);
    });
}

function goToNextSubject() {
    if (currentSubjectIndex < subjectOrder.length - 1) {
        currentSubjectIndex++;
        currentSubject = subjectOrder[currentSubjectIndex];

        // подсветка кнопки предмета
        subjectBtns.forEach(b =>
            b.classList.toggle(
                "exam__subject--active",
                b.dataset.subject === currentSubject
            )
        );

        renderQuestion();
    } else {
        // если это был последний предмет
        finishExam();
    }
}




