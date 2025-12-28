const form = document.getElementById("testForm");
const resultBlock = document.getElementById("result");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    let score = 0;
    const answers = new FormData(form);

    for (let value of answers.values()) {
        score += Number(value);
    }

    let level = "";
    let description = "";

    if (score <= 3) {
        level = "A1";
        description = "Начальный уровень";
    } else if (score <= 6) {
        level = "A2";
        description = "Базовый уровень";
    } else if (score <= 8) {
        level = "B1";
        description = "Средний уровень";
    } else {
        level = "B2";
        description = "Продвинутый уровень";
    }

    resultBlock.innerHTML = `
        <h3>Ваш результат</h3>
        <p>Правильных ответов: <strong>${score}</strong></p>
        <p>Уровень: <strong>${level}</strong></p>
        <p>${description}</p>
    `;
});
