(function () {
    const burger = document.querySelector(".header__burger");
    const mobile = document.querySelector(".header__mobile");
    if (!burger || !mobile) return;

    // создаём overlay 1 раз
    const overlay = document.createElement("div");
    overlay.className = "header__overlay";
    overlay.hidden = true;
    document.body.appendChild(overlay);

    function openMenu() {
        mobile.removeAttribute("hidden");
        overlay.hidden = false;

        document.body.classList.add("is-menu-open");
        burger.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
        mobile.setAttribute("hidden", "");
        overlay.hidden = true;

        document.body.classList.remove("is-menu-open");
        burger.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
        const isOpen = !mobile.hasAttribute("hidden");
        if (isOpen) closeMenu();
        else openMenu();
    }

    burger.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });

    mobile.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link) closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) closeMenu();
    });

    // старт
    closeMenu();
})();
