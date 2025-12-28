const header = document.getElementById('header');
const langButtons = document.querySelectorAll('.lang');
const elements = document.querySelectorAll('[data-key]');
const cta = document.getElementById('cta');

/* Движение хедера за курсором */
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX - window.innerWidth / 2) / 60;
    const y = (e.clientY - window.innerHeight / 2) / 60;

    header.style.transform = `
        translateX(-50%)
        translate(${x}px, ${y}px)
    `;
});

/* Переводы */
const translations = {
    kz: {
        about: 'Біз туралы',
        benefits: 'Артықшылықтар',
        courses: 'Курстар',
        contacts: 'Байланыс',
        cta: 'Курсқа жазылу'
    },
    ru: {
        about: 'О нас',
        benefits: 'Преимущества',
        courses: 'Курсы',
        contacts: 'Контакты',
        cta: 'Проверить свой уровень'
    },
    en: {
        about: 'About',
        benefits: 'Benefits',
        courses: 'Courses',
        contacts: 'Contacts',
        cta: 'Enroll'
    }
};

/* Функция установки языка */
function setLanguage(lang) {
    langButtons.forEach(b => b.classList.remove('active'));
    document
        .querySelector(`.lang[data-lang="${lang}"]`)
        .classList.add('active');

    elements.forEach(el => {
        const key = el.dataset.key;
        el.textContent = translations[lang][key];
    });

    cta.textContent = translations[lang].cta;
}

/* Клики */
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

/* 🚀 УСТАНАВЛИВАЕМ РУССКИЙ ПО УМОЛЧАНИЮ */
setLangu
