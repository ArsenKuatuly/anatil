document.addEventListener("DOMContentLoaded", () => {
    const toggles = document.querySelectorAll(".js-toggle-password");

    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const wrapper = toggle.closest(".auth__password-wrapper");
            const input = wrapper.querySelector(".js-password");

            const isHidden = input.type === "password";

            input.type = isHidden ? "text" : "password";
            toggle.src = isHidden
                ? "imgs/dshowpass.png"
                : "imgs/showpass.png";
        });
    });
});
