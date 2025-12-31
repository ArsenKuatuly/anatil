const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const db = require("../db");
require("../models/user.model");

const app = express();

app.use(express.static("public"));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../public/uploads/avatars");

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `user_${req.session.userId}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Только изображения"));
        }
        cb(null, true);
    }
});



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

    try {
        const hash = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (login, password) VALUES (?, ?)",
            [login, hash]
        );

        res.json({
            success: true,
            message: "Регистрация успешна"
        });

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.json({
                success: false,
                message: "Пользователь уже существует"
            });
        }

        console.error(err);
        res.status(500).json({ success: false });
    }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
    const { login, password } = req.body;

    try {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE login = ?",
            [login]
        );

        const user = rows[0];

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

        req.session.userId = user.id;
        req.session.login = user.login;

        res.json({
            success: true,
            message: "Вход выполнен"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

/* ================= GET PROFILE ================= */
app.get("/api/profile", auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT
                first_name,
                last_name,
                phone,
                location,
                username,
                email,
                avatar
            FROM user_profiles
            WHERE user_id = ?
            `,
            [req.session.userId]
        );

        res.json({
            success: true,
            profile: rows[0] || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});




/* ================= SAVE PROFILE ================= */
app.post("/api/profile", auth, async (req, res) => {
    const {
        first_name,
        last_name,
        phone,
        location,
        username,
        email
    } = req.body;

    try {
        await db.execute(
            `
            INSERT INTO user_profiles
            (user_id, first_name, last_name, phone, location, username, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                phone = VALUES(phone),
                location = VALUES(location),
                username = VALUES(username),
                email = VALUES(email)
            `,
            [
                req.session.userId,
                first_name,
                last_name,
                phone,
                location,
                username,
                email
            ]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


app.post(
    "/api/profile/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {

        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        await db.execute(
            `
            INSERT INTO user_profiles (user_id, avatar)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE avatar = VALUES(avatar)
            `,
            [req.session.userId, avatarPath]
        );

        res.json({
            success: true,
            avatar: avatarPath
        });
    }
);

/* ================= CURRENT USER ================= */
app.get("/api/me", auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT avatar FROM user_profiles WHERE user_id = ?",
            [req.session.userId]
        );

        res.json({
            success: true,
            user: {
                id: req.session.userId,
                login: req.session.login,
                avatar: rows[0]?.avatar || "/uploads/avatars/default.png"
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

/* ================= SAVE TEST RESULT ================= */
app.post("/api/save-result", auth, async (req, res) => {
    const {
        totalScore,
        level,
        reading,
        listening,
        math
    } = req.body;

    try {
        await db.execute(
            `
            INSERT INTO test_results
            (user_id, total_score, level, reading_score, listening_score, math_score)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                req.session.userId,
                totalScore,
                level,
                reading,
                listening,
                math
            ]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


/* ================= PROTECTED PAGE ================= */
app.get("/dashboard", auth, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/dashboard.html"));
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






