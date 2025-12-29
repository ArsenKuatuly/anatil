
    (async function () {
    const form = document.getElementById("profileForm");
    if (!form) return;

    /* ===== LOAD PROFILE ===== */
    try {
    const res = await fetch("/api/profile", {
    credentials: "include"
});
    const data = await res.json();

    if (data.profile) {
    Object.keys(data.profile).forEach(key => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) field.value = data.profile[key] || "";
});
}
} catch (e) {
    console.error("Ошибка загрузки профиля");
}

    /* ===== SAVE PROFILE ===== */
    form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
});

    const result = await res.json();

    if (result.success) {
    alert("Профиль сохранён");
} else {
    alert("Ошибка сохранения");
}
});
})();

