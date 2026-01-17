const resultBlock = document.getElementById("testResultBlock");
const actionsBlock = document.getElementById("testActions");
const historyBlock = document.getElementById("historyBlock");

const retryBtn = document.getElementById("retryTestBtn");
const historyBtn = document.getElementById("historyBtn");

/* ===== ПЕРЕВОД УРОВНЕЙ ===== */
function humanLevel(level) {
    const map = {
        elementary: "Элементарный",
        basic: "Базовый",
        intermediate: "Средний",
        upper: "Выше среднего",
        advanced: "Высокий"
    };
    return map[level] || level;
}

/* ===== ПОСЛЕДНИЙ РЕЗУЛЬТАТ ===== */
(async () => {
    try {
        const res = await authFetch("/api/my-result");
        const data = await res.json();

        if (!data.success || !data.result) {
            resultBlock.innerHTML = `
                <p>
                    Вы ещё не проходили тест.<br>
                    <a href="/test.html"><b>Пройдите тест, чтобы узнать ваш уровень</b></a>
                </p>
            `;
            return;
        }

        resultBlock.innerHTML = `
            <p><b>Набранный вами балл:</b> ${data.result.total_score}</p>
            <p><b>Ваш уровень:</b> ${humanLevel(data.result.level)}</p>
            <p style="opacity:0.6;font-size:13px">
                Последнее прохождение:
                ${new Date(data.result.created_at).toLocaleDateString()}
            </p>
        `;

        actionsBlock.style.display = "block";

    } catch (err) {
        console.error(err);
        resultBlock.innerHTML = "<p>Ошибка загрузки результата</p>";
    }
})();

/* ===== СДАТЬ ТЕСТ ЗАНОВО ===== */
retryBtn.addEventListener("click", () => {
    window.location.href = "/test.html";
});

/* ===== ИСТОРИЯ ПОПЫТОК ===== */
historyBtn.addEventListener("click", async () => {
    const isVisible = historyBlock.style.display === "block";

    if (isVisible) {
        historyBlock.style.display = "none";
        historyBtn.textContent = "История попыток";
        return;
    }

    historyBtn.textContent = "Скрыть историю";
    historyBlock.style.display = "block";
    historyBlock.innerHTML = "Загрузка истории...";

    try {
        const res = await authFetch("/api/test-history");
        const data = await res.json();

        if (!data.success || !data.results || data.results.length === 0) {
            historyBlock.innerHTML = "<p>История пуста</p>";
            return;
        }

        historyBlock.innerHTML = data.results.map((r, i) => `
            <div style="margin-bottom:10px;">
                <b>Попытка ${i + 1}</b><br>
                Балл: ${r.total_score} |
                Уровень: ${humanLevel(r.level)}<br>
                <span style="opacity:0.6;font-size:12px">
                    ${new Date(r.created_at).toLocaleString()}
                </span>
            </div>
        `).join("");

    } catch (e) {
        console.error(e);
        historyBlock.innerHTML = "<p>Ошибка загрузки истории</p>";
    }
});
