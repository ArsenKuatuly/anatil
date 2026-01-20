// i18n.js — version for your current HTML (desktop + mobile)

const langButtons = document.querySelectorAll(".lang-switch__btn");
const elements = document.querySelectorAll("[data-key]");

const translations = {
    ru: {
        // NAV / header
        about: "О нас",
        courses_nav: "Курсы",
        important: "Преимущества",
        contacts: "Контакты",
        check_level: "Проверить свой уровень",

        // HERO
        hero_badge_open: "Набор открыт",
        hero_title: "Поможем поднять<br />ваш <span class='hero__title-accent'>казахский язык</span>",
        hero_subtitle:
            "Обучаем казахскому языку с нуля до уровня C1. Индивидуальный подход, современные методики и гарантированный результат.",
        hero_learn_more: "Узнать больше",
        hero_metric_graduates: "выпускников",
        hero_metric_success: "успеха",

        hero_levels_title: "Уровни Казахского языка",
        hero_levels_subtitle: "Выберите подходящий для вас уровень обучения",
        hero_levels_note: "От базового A1 до продвинутого C1 уровня владения языком",

        // PROMO
        promo_title:
            "AnaTil — место, где начинается свободное владение <span class='promo__highlight'>казахским языком</span>",
        promo_subtitle:
            "Более 2000 наших выпускников успешно сдали экзамены и используют казахский язык в повседневной жизни и профессиональной деятельности. Присоединяйтесь к сообществу тех, кто уже достиг своих целей вместе с AnaTil.",

        // REASONS
        reasons_title: "9 причин, почему вы должны выбрать AnaTil",
        reasons_subtitle:
            "Почему обучение с AnaTil даёт результат — быстро, понятно и с поддержкой.",
        reason_1: "Программа 2025 года, которая обновляется каждые 3 месяца",
        reason_2:
            "Обучение с помощью AI. AnaTil использует искусственный интеллект, который общается с вами на казахском языке, объясняет ошибки и помогает говорить увереннее, как настоящий преподаватель.",
        reason_3:
            "Индивидуальный подход. Платформа подстраивается под ваш уровень знаний — от начального до продвинутого, предлагая задания именно для вас.",
        reason_4:
            "Культура и язык вместе. Вы изучаете не только язык, но и культуру, традиции и особенности казахской речи.",
        reason_5: "Обучение в любое время и в любом месте. Учитесь с компьютера, планшета или телефона.",
        reason_6: "Прогресс и мотивация. Проходите уровни и получайте достижения, которые мотивируют не бросать обучение.",
        reason_7: "Современный и удобный интерфейс. Минималистичный дизайн делает обучение приятным.",
        reason_8: "Объяснения на понятном языке. Сложная грамматика объясняется простыми словами.",
        reason_9: "Практика живого общения. Учитесь через реальные диалоги, которые используете в жизни.",

        // COURSES
        courses_title: "Доступные курсы",
        courses_subtitle: "Выберите уровень и начните обучение — от базового до продвинутого.",
        next_start: "Ближайший старт:",
        closed: "Запись закрыта",
        oct_18: "18 октября",

        course_a1_title: "A1 - Элементарный уровень",
        course_a1_desc: "Человек понимает и использует самые простые слова и выражения.",
        course_a2_title: "A2 - Базовый уровень",
        course_a2_desc: "Понимание и использование языка в повседневных ситуациях.",
        course_b1_title: "B1 - Средний уровень",
        course_b1_desc: "Уверенное общение в большинстве жизненных ситуаций.",
        course_b2_title: "B2 - Уровень выше среднего",
        course_b2_desc: "Свободное и уверенное использование языка.",
        course_c1_title: "C1 - Высокий уровень",
        course_c1_desc: "Почти свободное владение языком.",

        // FOOTER
        footer_info: "AnaTil",
        footer_text: "место, где каждый, независимо от уровня подготовки, может изучать казахский язык",
        footer_info_title: "Информация",
        footer_about: "О нас",
        footer_benefits: "Преимущества",
        footer_contacts: "Контакты",
        footer_courses_title: "Курсы",
        footer_course_a1: "Элементарный уровень",
        footer_course_a2: "Базовый уровень",
        footer_course_b1: "Средний уровень",
        footer_course_b2: "Уровень выше среднего",
        footer_course_c1: "Высокий уровень",
    },

    kz: {
        // NAV / header
        about: "Біз туралы",
        courses_nav: "Курстар",
        important: "Артықшылықтар",
        contacts: "Байланыс",
        check_level: "Деңгейіңізді тексеру",

        // HERO
        hero_badge_open: "Қабылдау ашық",
        hero_title: "Қазақ тілін<br />жақсартуға <span class='hero__title-accent'>көмектесеміз</span>",
        hero_subtitle:
            "Қазақ тілін нөлден C1 деңгейіне дейін үйретеміз. Жеке тәсіл, заманауи әдістемелер және нақты нәтиже.",
        hero_learn_more: "Толығырақ",
        hero_metric_graduates: "түлек",
        hero_metric_success: "нәтиже",

        hero_levels_title: "Қазақ тілі деңгейлері",
        hero_levels_subtitle: "Өзіңізге ыңғайлы оқу деңгейін таңдаңыз",
        hero_levels_note: "A1 базалық деңгейінен C1 жоғары деңгейіне дейін",

        // PROMO
        promo_title:
            "AnaTil — <span class='promo__highlight'>қазақ тілін</span> еркін меңгеру басталатын орын",
        promo_subtitle:
            "2000+ түлегіміз емтихандарды сәтті тапсырып, қазақ тілін күнделікті өмірде және жұмыста қолданады. Мақсатына AnaTil-мен бірге жеткендер қатарына қосылыңыз.",

        // REASONS
        reasons_title: "AnaTil таңдаудың 9 себебі",
        reasons_subtitle: "AnaTil-мен оқу нәтижелі — тез, түсінікті және қолдаумен.",
        reason_1: "2025 жылғы бағдарлама, әр 3 ай сайын жаңартылады",
        reason_2: "AI көмегімен оқу. Қателерді түсіндіреді және сенімді сөйлеуге көмектеседі.",
        reason_3: "Жеке тәсіл. Жүйе сіздің деңгейіңізге қарай тапсырма ұсынады.",
        reason_4: "Тіл мен мәдениет бірге. Дәстүр мен сөйлеу ерекшелігін де үйренесіз.",
        reason_5: "Кез келген уақытта, кез келген жерде. Компьютерден де, телефоннан да оқыңыз.",
        reason_6: "Прогресс пен мотивация. Деңгей өтіп, жетістіктер аласыз.",
        reason_7: "Заманауи әрі ыңғайлы интерфейс. Оқу жағымды әрі жеңіл.",
        reason_8: "Қарапайым түсіндіру. Күрделі грамматика жеңіл тілмен беріледі.",
        reason_9: "Тірі сөйлесу практикасы. Нағыз диалогтар арқылы үйренесіз.",

        // COURSES
        courses_title: "Қолжетімді курстар",
        courses_subtitle: "Деңгейді таңдаңыз да оқуды бастаңыз — бастапқыдан жоғарыға дейін.",
        next_start: "Жақын басталу:",
        closed: "Тіркелу жабық",
        oct_18: "18 қазан",

        course_a1_title: "A1 – Бастапқы деңгей",
        course_a1_desc: "Ең қарапайым сөздер мен тіркестерді түсіну және қолдану.",
        course_a2_title: "A2 – Негізгі деңгей",
        course_a2_desc: "Күнделікті жағдайларда тілді қолдану.",
        course_b1_title: "B1 – Орта деңгей",
        course_b1_desc: "Көптеген өмірлік жағдайларда еркін сөйлесу.",
        course_b2_title: "B2 – Ортадан жоғары деңгей",
        course_b2_desc: "Тілді еркін және сенімді пайдалану.",
        course_c1_title: "C1 – Жоғары деңгей",
        course_c1_desc: "Тілді дерлік еркін меңгеру.",

        // FOOTER
        footer_info: "AnaTil",
        footer_text: "әр адам дайындық деңгейіне қарамастан қазақ тілін үйрене алатын орын",
        footer_info_title: "Ақпарат",
        footer_about: "Біз туралы",
        footer_benefits: "Артықшылықтар",
        footer_contacts: "Байланыс",
        footer_courses_title: "Курстар",
        footer_course_a1: "Бастапқы деңгей",
        footer_course_a2: "Негізгі деңгей",
        footer_course_b1: "Орта деңгей",
        footer_course_b2: "Ортадан жоғары",
        footer_course_c1: "Жоғары деңгей",
    },

    en: {
        // NAV / header
        about: "About",
        courses_nav: "Courses",
        important: "Important",
        contacts: "Contacts",
        check_level: "Check your level",

        // HERO
        hero_badge_open: "Enrollment open",
        hero_title: "We help you improve<br />your <span class='hero__title-accent'>Kazakh language</span>",
        hero_subtitle:
            "We teach Kazakh from scratch up to C1 level. Personalized approach, modern methods, and guaranteed results.",
        hero_learn_more: "Learn more",
        hero_metric_graduates: "graduates",
        hero_metric_success: "success",

        hero_levels_title: "Kazakh language levels",
        hero_levels_subtitle: "Choose the level that suits you best",
        hero_levels_note: "From basic A1 to advanced C1 proficiency",

        // PROMO
        promo_title:
            "AnaTil — the place where fluent <span class='promo__highlight'>Kazakh</span> begins",
        promo_subtitle:
            "More than 2000 graduates have successfully passed exams and use Kazakh in everyday life and professional work. Join the community of people who reached their goals with AnaTil.",

        // REASONS
        reasons_title: "9 reasons to choose AnaTil",
        reasons_subtitle: "Learning with AnaTil works — fast, clear, and with support.",
        reason_1: "2025 program updated every 3 months",
        reason_2: "AI-powered learning that explains mistakes and boosts speaking confidence.",
        reason_3: "Personalized approach with tasks tailored to your level.",
        reason_4: "Language and culture together — traditions and real speech patterns.",
        reason_5: "Learn anytime, anywhere — laptop, tablet, or phone.",
        reason_6: "Progress and motivation — levels and achievements keep you going.",
        reason_7: "Modern, удобный интерфейс — minimal design for комфорт learning.",
        reason_8: "Clear explanations — complex grammar made simple.",
        reason_9: "Real communication practice through lifelike dialogues.",

        // COURSES
        courses_title: "Available courses",
        courses_subtitle: "Pick a level and start learning — from basic to advanced.",
        next_start: "Next start:",
        closed: "Enrollment closed",
        oct_18: "October 18",

        course_a1_title: "A1 – Elementary level",
        course_a1_desc: "Understanding and using very basic words and expressions.",
        course_a2_title: "A2 – Basic level",
        course_a2_desc: "Using the language in everyday situations.",
        course_b1_title: "B1 – Intermediate level",
        course_b1_desc: "Confident communication in most situations.",
        course_b2_title: "B2 – Upper-intermediate level",
        course_b2_desc: "Fluent and confident use of the language.",
        course_c1_title: "C1 – Advanced level",
        course_c1_desc: "Near-native command of the language.",

        // FOOTER
        footer_info: "AnaTil",
        footer_text: "a place where anyone can learn Kazakh regardless of their level",
        footer_info_title: "Information",
        footer_about: "About",
        footer_benefits: "Benefits",
        footer_contacts: "Contacts",
        footer_courses_title: "Courses",
        footer_course_a1: "Elementary level",
        footer_course_a2: "Basic level",
        footer_course_b1: "Intermediate level",
        footer_course_b2: "Upper-intermediate level",
        footer_course_c1: "Advanced level",
    },
};

function setActiveButtons(lang) {
    langButtons.forEach((btn) => {
        btn.classList.toggle("lang-switch__btn--active", btn.dataset.lang === lang);
    });
}

function setLanguage(lang) {
    const dict = translations[lang] || translations.ru;

    setActiveButtons(lang);

    elements.forEach((el) => {
        const key = el.dataset.key;
        const value = dict[key];

        if (value == null) {
            console.warn(`Нет перевода для key: ${key} (${lang})`);
            return;
        }

        el.innerHTML = value;
    });

    localStorage.setItem("lang", lang);
}

langButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

document.addEventListener("DOMContentLoaded", () => {
    setLanguage(localStorage.getItem("lang") || "ru");
});
