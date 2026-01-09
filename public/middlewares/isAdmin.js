module.exports = function isAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).send("Не авторизован");
    }

    if (req.session.role !== "admin") {
        return res.status(403).send("Доступ запрещён");
    }

    next();
};
