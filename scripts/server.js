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
        WHERE course_id = (
            SELECT course_id FROM modules WHERE id = ?
        )
          AND position > (
            SELECT position FROM modules WHERE id = ?
        )
        ORDER BY position
            LIMIT 1
    `, [currentModuleId, currentModuleId]);

    if (!nextModule) return;

    await db.execute(`
        INSERT INTO user_module_progress (user_id, module_id, completed)
        VALUES (?, ?, 0)
            ON DUPLICATE KEY UPDATE
                                 completed = IF(completed = 1, 1, 0)
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
    try {
        const userId = req.session.userId;
        const lessonId = req.params.id;

        /* ================== 1️⃣ УРОК + МОДУЛЬ ================== */
        const [[lesson]] = await db.execute(`
            SELECT
                l.id,
                l.position        AS lesson_pos,
                m.id              AS module_id,
                m.position        AS module_pos,
                m.course_id
            FROM lessons l
            JOIN modules m ON m.id = l.module_id
            WHERE l.id = ?
        `, [lessonId]);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Урок не найден"
            });
        }

        /* ================== 2️⃣ ПЕРВЫЙ УРОК ПЕРВОГО МОДУЛЯ ================== */
        if (lesson.module_pos === 1 && lesson.lesson_pos === 1) {
            return next();
        }

        /* ================== 3️⃣ ПРЕДЫДУЩИЙ УРОК (внутри модуля) ================== */
        if (lesson.lesson_pos > 1) {
            const [[prevLesson]] = await db.execute(`
                SELECT ulp.completed
                FROM lessons l
                LEFT JOIN user_lesson_progress ulp
                       ON ulp.lesson_id = l.id
                      AND ulp.user_id = ?
                WHERE l.module_id = ?
                  AND l.position = ?
            `, [userId, lesson.module_id, lesson.lesson_pos - 1]);

            if (prevLesson && Number(prevLesson.completed) === 1) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: "Сначала завершите предыдущий урок"
            });
        }

        /* ================== 4️⃣ ПЕРВЫЙ УРОК НЕ ПЕРВОГО МОДУЛЯ ================== */
        const [[prevModule]] = await db.execute(`
            SELECT ump.completed
            FROM modules m
            LEFT JOIN user_module_progress ump
                   ON ump.module_id = m.id
                  AND ump.user_id = ?
            WHERE m.course_id = ?
              AND m.position = ?
        `, [userId, lesson.course_id, lesson.module_pos - 1]);

        if (prevModule && Number(prevModule.completed) === 1) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "Сначала завершите предыдущий модуль"
        });

    } catch (err) {
        console.error("❌ lessonAccess error:", err);
        res.status(500).json({
            success: false,
            message: "Ошибка проверки доступа"
        });
    }
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

        // ✅ гарантируем активный курс
        await db.execute(`
    INSERT INTO user_course_progress (user_id, course_id, completed)
    VALUES (?, ?, 0)
    ON DUPLICATE KEY UPDATE completed = 0
`, [userId, course.id]);

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





app.post("/api/lesson/complete", auth, async (req, res) => {
    const userId = req.session.userId;
    const { lessonId } = req.body;

    try {
        /* ================== 1️⃣ ЗАВЕРШАЕМ УРОК ================== */
        await db.execute(`
            INSERT INTO user_lesson_progress (user_id, lesson_id, completed, completed_at)
            VALUES (?, ?, 1, NOW())
                ON DUPLICATE KEY UPDATE
                                     completed = 1,
                                     completed_at = NOW()
        `, [userId, lessonId]);

        /* ================== 2️⃣ МОДУЛЬ И КУРС УРОКА ================== */
        const [[lesson]] = await db.execute(`
            SELECT
                l.module_id,
                m.course_id,
                m.position   AS module_position,
                c.position   AS course_position
            FROM lessons l
                     JOIN modules m ON m.id = l.module_id
                     JOIN courses c ON c.id = m.course_id
            WHERE l.id = ?
        `, [lessonId]);

        const moduleId = lesson.module_id;
        const courseId = lesson.course_id;

        /* ================== 3️⃣ ПРОВЕРКА УРОКОВ В МОДУЛЕ ================== */
        const [[unfinishedLessons]] = await db.execute(`
            SELECT COUNT(*) AS cnt
            FROM lessons l
                     LEFT JOIN user_lesson_progress ulp
                               ON ulp.lesson_id = l.id
                                   AND ulp.user_id = ?
            WHERE l.module_id = ?
              AND (ulp.completed IS NULL OR ulp.completed = 0)
        `, [userId, moduleId]);

        let moduleCompleted = false;
        let courseCompleted = false;
        let nextCourse = null;

        /* ================== 4️⃣ ЗАВЕРШЕНИЕ МОДУЛЯ ================== */
        if (unfinishedLessons.cnt === 0) {
            await db.execute(`
                INSERT INTO user_module_progress (user_id, module_id, completed, completed_at)
                VALUES (?, ?, 1, NOW())
                    ON DUPLICATE KEY UPDATE
                                         completed = 1,
                                         completed_at = NOW()
            `, [userId, moduleId]);

            moduleCompleted = true;

            /* ================== 5️⃣ ПРОВЕРКА МОДУЛЕЙ В КУРСЕ ================== */
            const [[unfinishedModules]] = await db.execute(`
                SELECT COUNT(*) AS cnt
                FROM modules m
                         LEFT JOIN user_module_progress ump
                                   ON ump.module_id = m.id
                                       AND ump.user_id = ?
                WHERE m.course_id = ?
                  AND (ump.completed IS NULL OR ump.completed = 0)
            `, [userId, courseId]);

            /* ================== 6️⃣ ЗАВЕРШЕНИЕ КУРСА ================== */
            if (unfinishedModules.cnt === 0) {
                await db.execute(`
                    UPDATE user_course_progress
                    SET completed = 1,
                        completed_at = NOW()
                    WHERE user_id = ?
                      AND course_id = ?
                `, [userId, courseId]);

                courseCompleted = true;

                /* ================== 7️⃣ СЛЕДУЮЩИЙ КУРС ================== */
                const [[next]] = await db.execute(`
                    SELECT id, slug, title
                    FROM courses
                    WHERE position = (
                        SELECT position + 1
                        FROM courses
                        WHERE id = ?
                    )
                        LIMIT 1
                `, [courseId]);

                if (next) {
                    nextCourse = next;

                }
            }
        }


        /* ================== 8️⃣ ОТВЕТ ================== */
        res.json({
            success: true,
            moduleCompleted,
            courseCompleted,
            nextCourse
        });

    } catch (err) {
        console.error("❌ lesson complete error:", err);
        res.status(500).json({ success: false });
    }
});




app.get("/api/continue-lesson", auth, async (req, res) => {
    const userId = req.session.userId;

    try {
        /* 1️⃣ активный курс */
        const [[course]] = await db.execute(`
            SELECT course_id
            FROM user_course_progress
            WHERE user_id = ?
              AND completed = 0
                LIMIT 1
        `, [userId]);

        if (!course) {
            return res.json({ success: false, courseCompleted: true });
        }

        const courseId = course.course_id;

        /* 2️⃣ следующий доступный урок */
        const [[lesson]] = await db.execute(`
            SELECT l.id
            FROM lessons l
                     JOIN modules m ON m.id = l.module_id
                     LEFT JOIN user_lesson_progress ulp
                               ON ulp.lesson_id = l.id
                                   AND ulp.user_id = ?
            WHERE m.course_id = ?
              AND (ulp.completed IS NULL OR ulp.completed = 0)
            ORDER BY m.position, l.position
                LIMIT 1
        `, [userId, courseId]);

        /* 3️⃣ если урок найден → идём в него */
        if (lesson) {
            return res.json({
                success: true,
                lessonId: lesson.id
            });
        }

        /* 4️⃣ иначе — курс завершён */
        await db.execute(`
            UPDATE user_course_progress
            SET completed = 1, completed_at = NOW()
            WHERE user_id = ?
              AND course_id = ?
        `, [userId, courseId]);

        res.json({
            success: true,
            courseCompleted: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});





app.get("/api/course/:slug", auth, async (req, res) => {
    const userId = req.session.userId;
    const { slug } = req.params;

    try {
        /* 1️⃣ курс */
        const [[course]] = await db.execute(`
            SELECT id, title, slug
            FROM courses
            WHERE slug = ?
        `, [slug]);

        if (!course) {
            return res.json({ success: false });
        }

        /* 2️⃣ модули курса */
        const [modules] = await db.execute(`
            SELECT
                m.id,
                m.title,
                m.position,
                IF(ump.completed = 1, 1, 0) AS completed,
                IF(
                        m.position = 1,
                        0,
                        EXISTS (
                            SELECT 1
                            FROM modules pm
                                     LEFT JOIN user_module_progress ump2
                                               ON ump2.module_id = pm.id
                                                   AND ump2.user_id = ?
                            WHERE pm.course_id = m.course_id
                              AND pm.position = m.position - 1
                              AND (ump2.completed IS NULL OR ump2.completed = 0)

                        )
                ) AS locked
            FROM modules m
                     LEFT JOIN user_module_progress ump
                               ON ump.module_id = m.id
                                   AND ump.user_id = ?
            WHERE m.course_id = ?
            ORDER BY m.position
        `, [userId, userId, course.id]);


        /* 3️⃣ уроки для каждого модуля */
        for (const module of modules) {
            const [lessons] = await db.execute(`
                SELECT
                    l.id,
                    l.title,
                    l.position,
                    IF(ulp.completed = 1, 1, 0) AS completed
                FROM lessons l
                         LEFT JOIN user_lesson_progress ulp
                                   ON ulp.lesson_id = l.id
                                       AND ulp.user_id = ?
                WHERE l.module_id = ?
                ORDER BY l.position
            `, [userId, module.id]);

            module.lessons = lessons; // 🔥 ВАЖНО
        }

        res.json({
            success: true,
            course,
            modules
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});









app.get("/api/lesson/:id", auth, lessonAccess, async (req, res) => {
    const lessonId = req.params.id;

    try {
        const [[lesson]] = await db.execute(`
            SELECT
                l.title,
                l.content,
                c.slug AS courseSlug
            FROM lessons l
                     JOIN modules m ON m.id = l.module_id
                     JOIN courses c ON c.id = m.course_id
            WHERE l.id = ?
        `, [lessonId]);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Урок не найден"
            });
        }

        res.json({
            success: true,
            lesson
        });

    } catch (err) {
        console.error("GET /api/lesson/:id", err);
        res.status(500).json({
            success: false,
            message: "Ошибка сервера"
        });
    }
});



app.get("/api/module/:id/lessons", auth, async (req, res) => {
    const userId = req.session.userId;

    const moduleId = req.params.id;

    const [lessons] = await db.query(`
        SELECT 
            l.id,
            l.title,
            l.position,
            ulp.completed
        FROM lessons l
        LEFT JOIN user_lesson_progress ulp
            ON ulp.lesson_id = l.id
            AND ulp.user_id = ?
        WHERE l.module_id = ?
        ORDER BY l.position
    `, [userId, moduleId]);

    res.json({ success: true, lessons });
});

app.get("/api/my-active-course", auth, async (req, res) => {
    const userId = req.session.userId;

    const [[course]] = await db.execute(`
        SELECT c.slug
        FROM user_course_progress ucp
        JOIN courses c ON c.id = ucp.course_id
        WHERE ucp.user_id = ?
          AND ucp.completed = 0
        LIMIT 1
    `, [userId]);

    if (!course) {
        return res.json({ success: false });
    }

    res.json({
        success: true,
        slug: course.slug
    });
});





app.listen(3000, () => {
    console.log("http://localhost:3000");
});

