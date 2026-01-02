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

async function unlockNextModule(userId, currentModuleId) {
    const [[nextModule]] = await db.execute(`
        SELECT id
        FROM modules
        WHERE position > (
            SELECT position FROM modules WHERE id = ?
        )
        ORDER BY position
        LIMIT 1
    `, [currentModuleId]);

    if (!nextModule) return;

    await db.execute(`
        INSERT IGNORE INTO user_module_progress (user_id, module_id, completed)
        VALUES (?, ?, 0)
    `, [userId, nextModule.id]);
}

/* ================= MIDDLEWARE ================= */
app.use(express.json());


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
        return res.status(401).json({
            success: false,
            message: "Не авторизован"
        });
    }
    next();
}

async function lessonAccess(req, res, next) {
    const userId = req.session.userId;
    const lessonId = req.body.lessonId || req.params.lessonId;


    const [[access]] = await db.execute(`
        SELECT ump.completed
        FROM lessons l
        JOIN modules m ON m.id = l.module_id
        LEFT JOIN user_module_progress ump
            ON ump.module_id = m.id
            AND ump.user_id = ?
        WHERE l.id = ?
    `, [userId, lessonId]);

    if (!access || access.completed === 0) {
        return res.status(403).json({
            success: false,
            message: "Модуль заблокирован"
        });
    }

    next(); // ← если всё ок, идём дальше
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

goHome.addEventListener("click", async () => {
    try {
        const res = await fetch("/api/me", {
            credentials: "include"
        });

        if (res.status === 401) {
            window.location.href = "/index.html";
        } else {
            window.location.href = "/dashboard.html";
        }
    } catch {
        window.location.href = "/index.html";
    }
});




/* ================= LAST TEST RESULT ================= */
app.get("/api/test-result/last", auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT
                total_score,
                level,
                reading_score,
                listening_score,
                math_score,
                created_at
            FROM test_results
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [req.session.userId]
        );

        res.json({
            success: true,
            result: rows[0] || null
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

/* ================= GET MY TEST RESULT ================= */
app.get("/api/my-result", auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT
                total_score,
                level,
                reading_score,
                listening_score,
                math_score,
                created_at
            FROM test_results
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [req.session.userId]
        );

        if (rows.length === 0) {
            return res.json({
                success: true,
                result: null
            });
        }

        res.json({
            success: true,
            result: rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

app.get("/api/my-course", auth, async (req, res) => {
    const userId = req.session.userId;

    try {
        // 1. последний результат теста
        const [[test]] = await db.execute(`
            SELECT level
            FROM test_results
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [userId]);

        if (!test) {
            return res.json({
                success: false,
                message: "Тест не пройден"
            });
        }

        // 2. курс по уровню
        const [[course]] = await db.execute(`
            SELECT id, title, slug, level
            FROM courses
            WHERE level = ?
            LIMIT 1
        `, [test.level]);

        if (!course) {
            return res.json({
                success: false,
                message: "Курс для уровня не найден"
            });
        }

        res.json({
            success: true,
            course
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


async function courseAccess(req, res, next) {
    const userId = req.session.userId;
    const courseSlug = req.params.slug;

    const [[test]] = await db.execute(`
        SELECT level
        FROM test_results
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `, [userId]);

    const [[course]] = await db.execute(`
        SELECT level
        FROM courses
        WHERE slug = ?
    `, [courseSlug]);

    if (!test || !course || test.level !== course.level) {
        return res.status(403).send("Доступ запрещён");
    }

    next();
}

app.get("/courses/:slug", auth, courseAccess, (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/courses", `${req.params.slug}.html`)
    );
});




app.get("/api/test-history", auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT
                total_score,
                level,
                created_at
            FROM test_results
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [req.session.userId]
        );

        res.json({
            success: true,
            results: rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});





app.post(
    "/api/lesson/complete",
    auth,
    lessonAccess,
    async (req, res) => {

    const { lessonId } = req.body;
    const userId = req.session.userId;

    try {
        // 1. Отмечаем урок пройденным
        await db.execute(`
            INSERT INTO user_lesson_progress (user_id, lesson_id, completed, completed_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE
                completed = 1,
                completed_at = NOW()
        `, [userId, lessonId]);

        // 2. Узнаем модуль урока
        const [[lesson]] = await db.execute(`
            SELECT module_id FROM lessons WHERE id = ?
        `, [lessonId]);

        // 3. Проверяем: все ли уроки модуля пройдены
        const [[stats]] = await db.execute(`
            SELECT
                COUNT(l.id) AS total,
                SUM(IF(ulp.completed = 1, 1, 0)) AS completed
            FROM lessons l
            LEFT JOIN user_lesson_progress ulp
                ON ulp.lesson_id = l.id
                AND ulp.user_id = ?
            WHERE l.module_id = ?
        `, [userId, lesson.module_id]);

        // 4. Если модуль завершён — сохраняем
        if (stats.total === stats.completed) {
            await db.execute(`
                INSERT INTO user_module_progress (user_id, module_id, completed, completed_at)
                VALUES (?, ?, 1, NOW())
                ON DUPLICATE KEY UPDATE
                    completed = 1,
                    completed_at = NOW()
            `, [userId, lesson.module_id]);

            // 5. Открываем следующий модуль
            await unlockNextModule(userId, lesson.module_id);
        }

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

app.get("/api/continue-lesson", auth, async (req, res) => {
    const userId = req.session.userId;

    try {
        // 1️⃣ первый доступный модуль
        const [[module]] = await db.execute(`
            SELECT m.id
            FROM modules m
            LEFT JOIN user_module_progress ump
                ON ump.module_id = m.id
                AND ump.user_id = ?
            WHERE ump.completed IS NULL OR ump.completed = 0
            ORDER BY m.position
            LIMIT 1
        `, [userId]);

        if (!module) {
            return res.json({
                success: false,
                message: "Все модули пройдены"
            });
        }

        // 2️⃣ первый НЕ пройденный урок в модуле
        const [[lesson]] = await db.execute(`
            SELECT l.id
            FROM lessons l
            LEFT JOIN user_lesson_progress ulp
                ON ulp.lesson_id = l.id
                AND ulp.user_id = ?
            WHERE l.module_id = ?
              AND (ulp.completed IS NULL OR ulp.completed = 0)
            ORDER BY l.position
            LIMIT 1
        `, [userId, module.id]);

        if (!lesson) {
            return res.json({
                success: false,
                message: "Нет доступных уроков"
            });
        }

        res.json({
            success: true,
            lessonId: lesson.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


app.get("/api/course/:level", auth, async (req, res) => {
    const userId = req.session.userId;

    try {
        const [modules] = await db.execute(`
            SELECT
                m.id,
                m.title,
                IF(ump.completed IS NULL, 0, ump.completed) AS completed
            FROM modules m
                     LEFT JOIN user_module_progress ump
                               ON ump.module_id = m.id
                                   AND ump.user_id = ?
            ORDER BY m.position
        `, [userId]);

        // уроки
        for (const module of modules) {
            const [lessons] = await db.execute(`
                SELECT
                    l.id,
                    l.title,
                    IF(ulp.completed = 1, 1, 0) AS completed
                FROM lessons l
                         LEFT JOIN user_lesson_progress ulp
                                   ON ulp.lesson_id = l.id
                                       AND ulp.user_id = ?
                WHERE l.module_id = ?
                ORDER BY l.position
            `, [userId, module.id]);

            module.lessons = lessons;
        }

        // 🔒 блокировка модулей
        for (let i = 0; i < modules.length; i++) {
            if (i === 0) {
                modules[i].locked = false;
            } else {
                modules[i].locked = !modules[i - 1].completed;
            }
        }

        res.json({ success: true, modules });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});









app.listen(3000, () => {
    console.log("http://localhost:3000");
});

