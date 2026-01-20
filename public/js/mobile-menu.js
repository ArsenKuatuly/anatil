const header = document.getElementById("header");
const burger = header?.querySelector(".burger");
const mobileMenu = header?.querySelector(".mobile-menu");

function openMenu() {
    header.classList.add("header--menu-open");
    mobileMenu.hidden = false;
    burger.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    header.classList.remove("header--menu-open");
    mobileMenu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
}

burger?.addEventListener("click", () => {
    const isOpen = header.classList.contains("header--menu-open");
    isOpen ? closeMenu() : openMenu();
});

// закрыть по Esc
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
});

// закрыть при клике по пункту меню
mobileMenu?.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) closeMenu();
});
