(async function () {
    const avatarInput = document.getElementById("avatarInput");
    const avatarImage = document.getElementById("avatarImage");

    /* ===== LOAD AVATAR ===== */
    try {
    const res = await fetch("/api/profile", {
    credentials: "include"
});
    const data = await res.json();

    if (data.profile && data.profile.avatar) {
    avatarImage.src = data.profile.avatar;
}
} catch (e) {}

    /* ===== UPLOAD AVATAR ===== */
    avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/profile/avatar", {
    method: "POST",
    credentials: "include",
    body: formData
});

    const result = await res.json();

    if (result.success) {
    avatarImage.src = result.avatar + "?t=" + Date.now();
} else {
    alert("Ошибка загрузки аватара");
}
});
})();
