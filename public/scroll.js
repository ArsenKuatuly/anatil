document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        if (!targetId.startsWith("#")) return;

        e.preventDefault();

        const target = document.querySelector(targetId);
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth" });
    });
});
