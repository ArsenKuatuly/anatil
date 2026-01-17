window.authFetch = async function (url, options = {}) {
    const res = await fetch(url, {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth.html";
        throw new Error("Not authorized");
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP error ${res.status}`);
    }

    return res;
};
