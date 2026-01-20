import { subjects, subjectOrder } from "./questions.js";

/* ================= DOM ================= */
const root = document.getElementById("examRoot");
const questionEl = root.querySelector("#question");
const answersEl = root.querySelector("#answers");
const currentEl = root.querySelector("#current");
const progressEl = root.querySelector("#progress");
const nextBtn = root.querySelector("#nextBtn");
const prevBtn = root.querySelector("#prevBtn");
const timerEl = root.querySelector("#timer");
const subjectBtns = root.querySelectorAll(".exam__subject");

const globalAudioBlock = document.getElementById("globalAudioBlock");
const globalAudio = document.getElementById("globalAudio");

const finishBtn = document.getElementById("finishBtn");
const finishModal = document.getElementById("finishModal");
const cancelFinish = document.getElementById("cancelFinish");
const confirmFinish = document.getElementById("confirmFinish");

const resultModal = document.getElementById("resultModal");

/* ================= STATE ================= */
let currentSubject = "math";
let currentSubjectIndex = 0;
let examFinished = false;

const examState = {
  math: { index: 0, score: 0, answers: [] },
  reading: { index: 0, score: 0, answers: [] },
  listening: { index: 0, score: 0, answers: [] },
};

/* ================= TIMER ================= */
const EXAM_DURATION = 40 * 60; // seconds
const TIMER_KEY = "examEndTime";

function initTimer() {
  let endTime = Number(localStorage.getItem(TIMER_KEY));
  if (!endTime || endTime <= Date.now()) {
    endTime = Date.now() + EXAM_DURATION * 1000;
    localStorage.setItem(TIMER_KEY, String(endTime));
  }
  return endTime;
}

let examEndTime = initTimer();
let timerInterval = null;

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const remaining = Math.floor((examEndTime - Date.now()) / 1000);

    if (remaining <= 0) {
      stopTimer(true);
      timerEl.textContent = "00:00";
      finishExam();
      return;
    }

    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    timerEl.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    // подсветка когда меньше 5 минут
    timerEl.classList.toggle("exam__timer--low", remaining < 300);
  }, 1000);
}

function stopTimer(clearStorage = false) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  if (clearStorage) localStorage.removeItem(TIMER_KEY);
}

/* ================= UI HELPERS ================= */
function openModal(modalEl) {
  modalEl.classList.add("modal--open");
  modalEl.setAttribute("aria-hidden", "false");
}

function closeModal(modalEl) {
  modalEl.classList.remove("modal--open");
  modalEl.setAttribute("aria-hidden", "true");
}

function setActiveSubjectButton() {
  subjectBtns.forEach((b) => b.classList.toggle("exam__subject--active", b.dataset.subject === currentSubject));
}

function renderGlobalAudio() {
  const cfg = subjects[currentSubject];
  const shouldShow = currentSubject === "listening" && cfg.globalAudioSrc;

  globalAudioBlock.hidden = !shouldShow;
  if (!shouldShow) return;

  // обновим src если нужно
  const source = globalAudio.querySelector("source");
  if (source && source.getAttribute("src") !== cfg.globalAudioSrc) {
    source.setAttribute("src", cfg.globalAudioSrc);
    globalAudio.load();
  }
}

function renderQuestion() {
  currentSubjectIndex = subjectOrder.indexOf(currentSubject);

  const state = examState[currentSubject];
  const q = subjects[currentSubject].questions[state.index];

  renderGlobalAudio();

  questionEl.textContent = q.question;
  currentEl.textContent = String(state.index + 1);
  progressEl.textContent = `${state.index + 1} / ${subjects[currentSubject].questions.length}`;

  answersEl.innerHTML = "";
  nextBtn.disabled = true;
  prevBtn.disabled = state.index === 0;

  q.answers.forEach((text, i) => {
    const label = document.createElement("label");
    label.className = "exam__answer";

    const letter = String.fromCharCode(65 + i); // A, B, C...

    label.innerHTML = `
      <input class="exam__answer-input" type="radio" name="answer" value="${i}">
      <span class="exam__answer-letter" aria-hidden="true">${letter}</span>
      <span class="exam__answer-text">${escapeHtml(text)}</span>
      <span class="exam__answer-ind" aria-hidden="true"></span>
    `;

    const input = label.querySelector("input");

    // восстановление выбранного
    if (state.answers[state.index] === i) {
      input.checked = true;
      label.classList.add("is-selected");
      nextBtn.disabled = false;
    }

    input.addEventListener("change", () => {
      state.answers[state.index] = i;
      // fallback для браузеров без :has()
      answersEl.querySelectorAll(".exam__answer").forEach((el) => el.classList.remove("is-selected"));
      label.classList.add("is-selected");
      nextBtn.disabled = false;
    });

    answersEl.appendChild(label);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ================= RESULTS ================= */
function calculateScores() {
  Object.keys(examState).forEach((subject) => {
    const state = examState[subject];
    const qs = subjects[subject].questions;

    state.score = state.answers.reduce((sum, ans, i) => sum + (ans === qs[i]?.correct ? 1 : 0), 0);
  });
}

function getLevel(score) {
  if (score <= 6) return "elementary";
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
  advanced: "Высокий",
};

function showResult(score, level) {
  const percent = Math.round((score / 30) * 100);
  const levelText = levelTitles[level] || level;

  document.getElementById("resultPercent").textContent = `${percent}%`;
  document.getElementById("resultLevel").textContent = levelText;

  document.getElementById("mathScore").textContent = `${examState.math.score} / 10`;
  document.getElementById("readingScore").textContent = `${examState.reading.score} / 10`;
  document.getElementById("listeningScore").textContent = `${examState.listening.score} / 10`;

  openModal(resultModal);

  document.getElementById("goHome").onclick = () => (window.location.href = "/dashboard.html");
  document.getElementById("goProfile").onclick = () => (window.location.href = "/profile.html");
  document.getElementById("goCourses").onclick = () => (window.location.href = "/levelcourses.html");
}

async function saveResult(score, level) {
  if (typeof window.authFetch !== "function") return;

  try {
    await window.authFetch("/api/save-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalScore: score,
        level,
        math: examState.math.score,
        reading: examState.reading.score,
        listening: examState.listening.score,
      }),
    });
  } catch (e) {
    console.error("Ошибка сохранения результата", e);
  }
}

/* ================= FLOW ================= */
function goToNextSubject() {
  currentSubjectIndex++;
  if (currentSubjectIndex < subjectOrder.length) {
    currentSubject = subjectOrder[currentSubjectIndex];
    setActiveSubjectButton();
    renderQuestion();
  } else {
    finishExam();
  }
}

async function finishExam() {
  if (examFinished) return;
  examFinished = true;

  stopTimer(true);
  calculateScores();

  const totalScore = examState.math.score + examState.reading.score + examState.listening.score;
  const level = getLevel(totalScore);

  await saveResult(totalScore, level);
  showResult(totalScore, level);
}

function requestFinish() {
  if (examFinished) return;
  openModal(finishModal);
}

/* ================= EVENTS ================= */
subjectBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (examFinished) return;
    currentSubject = btn.dataset.subject;
    setActiveSubjectButton();
    renderQuestion();
  });
});

nextBtn.addEventListener("click", () => {
  if (examFinished) return;

  const state = examState[currentSubject];
  const total = subjects[currentSubject].questions.length;

  if (state.index < total - 1) {
    state.index++;
    renderQuestion();
  } else {
    goToNextSubject();
  }
});

prevBtn.addEventListener("click", () => {
  if (examFinished) return;

  const state = examState[currentSubject];
  if (state.index > 0) {
    state.index--;
    renderQuestion();
  }
});

finishBtn.addEventListener("click", requestFinish);

cancelFinish.addEventListener("click", () => closeModal(finishModal));
confirmFinish.addEventListener("click", async () => {
  closeModal(finishModal);
  await finishExam();
});

// overlay click
finishModal.querySelector(".modal__overlay")?.addEventListener("click", () => closeModal(finishModal));
resultModal.querySelector(".modal__overlay")?.addEventListener("click", () => closeModal(resultModal));

// back button: просим завершить
history.pushState(null, "", location.href);
window.addEventListener("popstate", () => {
  requestFinish();
  history.pushState(null, "", location.href);
});

// close tab / refresh
window.addEventListener("beforeunload", (e) => {
  if (!examFinished) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// optional: page hidden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) console.warn("Пользователь покинул страницу");
});

/* ================= START ================= */
setActiveSubjectButton();
renderQuestion();
startTimer();
