const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "empo",
  database: "mapaderiesgo",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

module.exports = db;
