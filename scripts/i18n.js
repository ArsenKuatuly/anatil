const langButtons = document.querySelectorAll('.lang');
const elements = document.querySelectorAll('[data-key]');

const translations = {
    ru: {
        /* HEADER */
        about: "О нас",
        benefits: "Преимущества",
        courses_nav: "Курсы",
        contacts: "Контакты",
        check_level: "Проверить свой уровень",

        /* HERO */
        hero_title: "Поможем поднять<br>ваш казахский язык",
        hero_subtitle: "Начните изучать казахский язык вместе с нами и поднимите свой уровень до C1",
        badge: "Уровни Казахского языка",
        level_a1: "A1 - Элементарный",
        level_a2: "A2 - Базовый",
        level_b1: "B1 - Средний",
        level_b2: "B2 - Выше среднего",
        level_c1: "C1 - Высокий",

        /* PROMO */
        promo_title: "AnaTil — место, где каждый, независимо от уровня<br>подготовки, может изучать <span class='promo__highlight'>казахский язык</span>",
        promo_subtitle: "Наши выпускники уверенно строят карьеру в ведущих IT-компаниях, не только в Казахстане, но и за его пределами",

        /* REASONS */
        reasons_title: "9 причин, почему вы должны выбрать AnaTil",
        reason_1: "Программа 2025 года, которая обновляется каждые 3 месяца",
        reason_2: "Обучение с помощью AI. AnaTil использует искусственный интеллект, который общается с вами на казахском языке, объясняет ошибки и помогает говорить увереннее.",
        reason_3: "Индивидуальный подход. Платформа подстраивается под ваш уровень знаний — от начального до продвинутого.",
        reason_4: "Культура и язык вместе. Вы изучаете не только язык, но и культуру и традиции.",
        reason_5: "Обучение в любое время и в любом месте. Учитесь с любого устройства.",
        reason_6: "Прогресс и мотивация. Отслеживайте результаты и достижения.",
        reason_7: "Современный и удобный интерфейс. Обучение без перегрузки.",
        reason_8: "Понятные объяснения сложной грамматики с примерами.",
        reason_9: "Практика живого общения в реальных жизненных ситуациях.",

        /* COURSES */
        courses_title: "Доступные курсы",
        next_start: "Ближайший старт:",
        closed: "Запись закрыта",
        oct_18: "18 октября",

        course_a1_title: "A1 - Элементарный уровень",
        course_a1_desc: "Понимание и использование самых простых слов.",
        course_a2_title: "A2 - Базовый уровень",
        course_a2_desc: "Использование языка в повседневных ситуациях.",
        course_b1_title: "B1 - Средний уровень",
        course_b1_desc: "Уверенное общение в большинстве ситуаций.",
        course_b2_title: "B2 - Уровень выше среднего",
        course_b2_desc: "Свободное и уверенное использование языка.",
        course_c1_title: "C1 - Высокий уровень",
        course_c1_desc: "Почти свободное владение языком.",

        /* FOOTER */
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
        footer_course_c1: "Высокий уровень"
    },

    kz: {
        about: "Біз туралы",
        benefits: "Артықшылықтар",
        courses_nav: "Курстар",
        contacts: "Байланыс",
        check_level: "Деңгейіңізді тексеру",
        hero_title: "Қазақ тілін<br>жақсартуға көмектесеміз",
        hero_subtitle: "Бізбен бірге қазақ тілін үйреніп, деңгейіңізді C1-ге дейін көтеріңіз",
        badge: "Қазақ тілі деңгейлері",
        level_a1: "A1 - Бастапқы",
        level_a2: "A2 - Негізгі",
        level_b1: "B1 - Орта",
        level_b2: "B2 - Ортадан жоғары",
        level_c1: "C1 - Жоғары",
        promo_title: "AnaTil — әр адам <span class='promo__highlight'>қазақ тілін</span> үйрене алатын орын",
        promo_subtitle: "Біздің түлектер Қазақстанда және шетелде табысты мансап құруда",
        reasons_title: "AnaTil таңдаудың 9 себебі",
        reason_1: "2025 жылғы бағдарлама, әр 3 ай сайын жаңартылады",
        reason_2: "AI көмегімен оқыту",
        reason_3: "Жеке тәсіл",
        reason_4: "Тіл мен мәдениет бірге",
        reason_5: "Кез келген уақытта оқу",
        reason_6: "Мотивация және прогресс",
        reason_7: "Ыңғайлы интерфейс",
        reason_8: "Қарапайым түсіндіру",
        reason_9: "Тірі сөйлесу практикасы",
        courses_title: "Қолжетімді курстар",
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

        next_start: "Басталу уақыты:",
        closed: "Тіркелу жабық",
        oct_18: "18 қазан",
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
        footer_course_c1: "Жоғары деңгей"
    },

    en: {
        about: "About",
        benefits: "Benefits",
        courses_nav: "Courses",
        contacts: "Contacts",
        check_level: "Check your level",
        hero_title: "We help you improve<br>your Kazakh language",
        hero_subtitle: "Learn Kazakh with us and reach C1 level",
        badge: "Kazakh language levels",
        level_a1: "A1 - Elementary",
        level_a2: "A2 - Basic",
        level_b1: "B1 - Intermediate",
        level_b2: "B2 - Upper-intermediate",
        level_c1: "C1 - Advanced",
        promo_title: "AnaTil — a place where anyone can learn <span class='promo__highlight'>Kazakh language</span>",
        promo_subtitle: "Our graduates build successful careers worldwide",
        reasons_title: "9 reasons to choose AnaTil",
        reason_1: "2025 program updated every 3 months",
        reason_2: "AI-powered learning",
        reason_3: "Personalized approach",
        reason_4: "Language and culture together",
        reason_5: "Learn anytime, anywhere",
        reason_6: "Progress tracking",
        reason_7: "Modern interface",
        reason_8: "Clear explanations",
        reason_9: "Real-life communication practice",
        courses_title: "Available courses",
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

        next_start: "Next start:",
        closed: "Enrollment closed",
        oct_18: "October 18",
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
        footer_course_c1: "Advanced level"

    }
};

function setLanguage(lang) {
    langButtons.forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.querySelector(`.lang[data-lang="${lang}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    elements.forEach(el => {
        const key = el.dataset.key;
        const value = translations[lang]?.[key];

        if (!value) {
            console.warn(`❌ Нет перевода для key: ${key} (${lang})`);
            return;
        }

        el.innerHTML = value;
    });

    localStorage.setItem('lang', lang);
}

langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

const savedLang = localStorage.getItem('lang') || 'ru';
setLanguage(savedLang);
