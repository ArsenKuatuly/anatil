window.authFetch = async function (url, options = {}) {
    const res = await fetch(url, {
        credentials: "include",
        ...options
    });

    if (res.status === 401) {
        window.location.href = "/auth.html";
        return;
    }

    return res;
};
