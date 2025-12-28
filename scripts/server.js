const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");
const db = require("../db");

require("../models/user.model"); // инициализация таблицы users

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.static("public"));

app.use(
    session({
        secret: "very-secret-key",
        resave: false,
        saveUninitialized: false
    })
);

/* ================= AUTH MIDDLEWARE ================= */
function auth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/");
    }
    next();
}

/* ================= REGISTRATION ================= */
app.post("/register", async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.json({ success: false, message: "Некорректные данные" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (login, password) VALUES (?, ?)",
        [login, hash],
        function (err) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Пользователь уже существует"
                });
            }

            res.json({
                success: true,
                message: "Регистрация успешна"
            });
        }
    );
});

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
    const { login, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE login = ?",
        [login],
        async (err, user) => {
            if (!user) {
                return res.json({
                    success: false,
                    message: "Неверный логин или пароль"
                });
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                return res.json({
                    success: false,
                    message: "Неверный логин или пароль"
                });
            }

            // ✅ сохраняем пользователя в сессии
            req.session.userId = user.id;
            req.session.login = user.login;

            res.json({
                success: true,
                message: "Вход выполнен"
            });
        }
    );
});

/* ================= PROTECTED PAGE ================= */
app.get("/dashboard", auth, (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/dashboard.html")
    );
});

/* ================= LOGOUT ================= */
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

/* ================= START ================= */
app.listen(3000, () => {
    console.log("http://localhost:3000");
});
