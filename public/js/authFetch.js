window.authFetch = async function (url, options = {}) {
    const res = await fetch(url, {
        ...options,
        credentials: "include"
    });


    if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth.html";
        throw new Error("Not authorized");
    }


    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }

    return res;
};
