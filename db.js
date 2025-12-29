const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",        // поменяй
    password: "Arsenkaz2005",        // поменяй
    database: "auth_db",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
