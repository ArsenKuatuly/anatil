

const exam = document.querySelector(".exam");

const questionEl = exam.querySelector("#question");
const answersEl = exam.querySelector("#answers");
const currentEl = exam.querySelector("#current");
const progressEl = exam.querySelector("#progress");
const nextBtn = exam.querySelector("#nextBtn");
const timerEl = exam.querySelector("#timer");
const subjectBtns = exam.querySelectorAll(".exam__subject");
const prevBtn = exam.querySelector("#prevBtn");


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
        title: "Грамматика казахского языка",
        questions: [
            {
                question: "Какой вариант означает «Я студент»?",
                answers: ["Мен студентпін", "Мен студент", "Мен студентсың"],
                correct: 0
            },
            {
                question: "Как правильно сказать «Ты ученик»?",
                answers: ["Сен оқушымын", "Сен оқушысың", "Сен оқушы"],
                correct: 1
            },
            {
                question: "Какой вопрос означает «Кто ты?»?",
                answers: ["Сен кімсің?", "Сен қайдасың?", "Сен не істейсің?"],
                correct: 0
            },
            {
                question: "Как правильно сказать «Он дома»?",
                answers: ["Ол үйде", "Ол үй", "Ол үймін"],
                correct: 0
            },
            {
                question: "Какой вариант означает «Мы идем»?",
                answers: ["Біз барамын", "Біз барасың", "Біз барамыз"],
                correct: 2
            },
            {
                question: "Как правильно сказать «Меня зовут Айбек»?",
                answers: ["Мен Айбекпін", "Менің атым Айбек", "Мен Айбек"],
                correct: 1
            },
            {
                question: "Какой вариант означает «Где школа?»?",
                answers: ["Мектеп қайда?", "Мектеп қандай?", "Мектеп кім?"],
                correct: 0
            },
            {
                question: "Как правильно сказать «Я не знаю»?",
                answers: ["Мен білмеймін", "Мен білесің", "Мен білемін"],
                correct: 0
            },
            {
                question: "Какой вариант означает «Сегодня холодно»?",
                answers: ["Бүгін суық", "Бүгін суықпын", "Бүгін суықсың"],
                correct: 0
            },
            {
                question: "Как правильно задать вопрос «Как дела?»?",
                answers: ["Қалайсың?", "Қайдасың?", "Кімсің?"],
                correct: 0
            }
        ]
    },

    listening: {
        title: "Слушание",
        questions: [
            {
                question: "Мәтіндегі кейіпкер қай жерде тұрады?",
                answers: ["Пәтерде", "Жер үйде", "Жатақханада"],
                correct: 1
            },
            {
                question: "Үйі қандай?",
                answers: ["Үлкен", "Екі қабатты", "Кішкентай"],
                correct: 2
            },
            {
                question: "Үйінде неше жатын бөлме бар?",
                answers: ["Бір", "Екі", "Үш"],
                correct: 1
            },
            {
                question: "Ата-анасы қай жерде ұйықтайды?",
                answers: ["Қонақ бөлмеде", "Асүйде", "Бір жатын бөлмеде"],
                correct: 2
            },
            {
                question: "Автор мен әпкесі қай жерде ұйықтайды?",
                answers: ["Басқа жатын бөлмеде", "Қонақ бөлмеде", "Асүйде"],
                correct: 0
            },
            {
                question: "Отбасы күнделікті қай жерде тамақтанады?",
                answers: ["Қонақ бөлмеде", "Асүйде", "Аулада"],
                correct: 1
            },
            {
                question: "Отбасы кешке не істейді?",
                answers: ["Кітап оқиды", "Теледидар көреді", "Серуендейді"],
                correct: 1
            },
            {
                question: "Жертөледе не бар?",
                answers: ["Қойма", "Әкемнің шеберханасы", "Жатын бөлме"],
                correct: 1
            },
            {
                question: "Әкесі не істейді?",
                answers: ["Көлік жөндейді", "Ағаштан жиһаз жасайды", "Тамақ пісіреді"],
                correct: 1
            },
            {
                question: "Аулада не бар?",
                answers: ["Тек гараж", "Бассейн мен ағаш", "Дүкен"],
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

    // ⬅⬅⬅ ВОТ ЭТО ДОБАВИТЬ
    prevBtn.disabled = state.index === 0;

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
prevBtn.addEventListener("click", () => {
    if (examFinished) return;

    const state = examState[currentSubject];
    if (state.index > 0) {
        state.index--;
        renderQuestion();
    }
});




const EXAM_DURATION = 40 * 60; // 40 минут в секундах
const TIMER_KEY = "examEndTime";

function initTimer() {
    let endTime = Number(localStorage.getItem(TIMER_KEY));


    if (!endTime || endTime <= Date.now()) {
        endTime = Date.now() + EXAM_DURATION * 1000;
        localStorage.setItem(TIMER_KEY, endTime);
    }

    return endTime;
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
const finishModal = document.getElementById("finishModal");
const cancelFinish = document.getElementById("cancelFinish");
const confirmFinish = document.getElementById("confirmFinish");

let examFinished = false;

function openFinishModal() {
    finishModal.classList.add("modal--open");
}

function closeFinishModal() {
    finishModal.classList.remove("modal--open");
}



// Отмена
cancelFinish.addEventListener("click", closeFinishModal);

// Подтверждение
confirmFinish.addEventListener("click", () => {
    closeFinishModal();
    finishExam();
});




async function finishExam() {
    if (examFinished) return;
    examFinished = true;

    clearInterval(timerInterval);
    localStorage.removeItem(TIMER_KEY);

    calculateScores();

    const totalScore =
        examState.math.score +
        examState.reading.score +
        examState.listening.score;

    const level = getLevel(totalScore);

    // ✅ ТОЛЬКО ЭТО
    await saveResult(totalScore, level);
    showResult(totalScore, level);
}







function getLevel(score) {
    if (score <= 6)  return "elementary";
    if (score <= 12) return "basic";
    if (score <= 18) return "intermediate";
    if (score <= 24) return "upper";
    return "advanced";
}

const levelTitles = {
    elementary: "Элементарный",
    basic: "Базовый",
    intermediate: "Средний",
    upper: "Выше среднего",
    advanced: "Высокий"
};


const resultModal = document.getElementById("resultModal");

function showResult(score, level) {
    const percent = Math.round((score / 30) * 100);
    const levelText = levelTitles[level] || level;

    document.getElementById("resultPercent").textContent = `${percent}%`;
    document.getElementById("resultLevel").textContent = levelText;

    document.getElementById("mathScore").textContent =
        `${examState.math.score} / 10`;

    document.getElementById("readingScore").textContent =
        `${examState.reading.score} / 10`;

    document.getElementById("listeningScore").textContent =
        `${examState.listening.score} / 10`;

    resultModal.classList.add("modal--open");

    document.getElementById("goHome").onclick = () => {
        window.location.href = "/index.html";
    };

    document.getElementById("goProfile").onclick = () => {
        window.location.href = "/profile.html";
    };

    document.getElementById("goCourses").onclick = () => {
        window.location.href = "/levelcourses.html";
    };
}


    document.getElementById("goHome").onclick = () => {
        window.location.href = "/index.html";
    };

    document.getElementById("goProfile").onclick = () => {
        window.location.href = "/profile.html";
    };


    document.getElementById("goCourses").onclick = () => {
        window.location.href = "/levelcourses.html";
    };




async function saveResult(score, level) {
    try {
        await authFetch("/api/save-result", {
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
    } catch (e) {
        // если пользователь не авторизован —
        // authFetch сам отправит на /login.html
        console.error("Ошибка сохранения результата", e);
    }
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
    currentSubjectIndex++;

    if (currentSubjectIndex < subjectOrder.length) {
        currentSubject = subjectOrder[currentSubjectIndex];
        renderQuestion();
    } else {
        finishExam();
    }
}


function requestFinish() {
    if (examFinished) return;

    if (!finishModal) {
        finishExam();
        return;
    }

    openFinishModal();
}

if (finishBtn) {
    finishBtn.addEventListener("click", requestFinish);
}

history.pushState(null, "", location.href);


window.addEventListener("popstate", () => {
    requestFinish();
    history.pushState(null, "", location.href);
});

window.addEventListener("beforeunload", (e) => {
    if (!examFinished) {
        e.preventDefault();
        e.returnValue = ""; // стандартное предупреждение браузера
    }
});




