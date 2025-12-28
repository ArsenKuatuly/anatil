const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
    path.join(__dirname, "database.db"),
    (err) => {
        if (err) {
            console.error("Ошибка БД:", err.message);
        } else {
            console.log("База данных подключена");
        }
    }
);

module.exports = db;
