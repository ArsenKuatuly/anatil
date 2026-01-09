document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {

        await fetch("/logout", {
            method: "POST",
            credentials: "include"
        });
    } catch (e) {
        console.warn("Logout error:", e);
    }


    localStorage.clear();
    sessionStorage.clear();


    window.location.href = "/auth.html";
});
