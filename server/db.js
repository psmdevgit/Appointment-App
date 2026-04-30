
const sql = require("mssql");
require("dotenv").config();

// ✅ DB1 (Login → 5.100)
const db1Config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// ✅ DB2 (Category → 5.13)
const db2Config = {
    user: process.env.DB2_USER,
    password: process.env.DB2_PASSWORD,
    server: process.env.DB2_SERVER,
    database: process.env.DB2_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// ✅ Separate pools
let pool1;
let pool2;

// 🔹 DB1 Connection
async function getConnection() {
    try {
        if (!pool1) {
            pool1 = await new sql.ConnectionPool(db1Config).connect();
            console.log("✅ DB1 Connected (5.100)");
        }
        return pool1;
    } catch (err) {
        console.log("❌ DB1 Connection Failed:", err);
        throw err;
    }
}

// 🔹 DB2 Connection
async function getDb2Connection() {
    try {
        if (!pool2) {
            pool2 = await new sql.ConnectionPool(db2Config).connect();
            console.log("✅ DB2 Connected (5.13)");
        }
        return pool2;
    } catch (err) {
        console.log("❌ DB2 Connection Failed:", err);
        throw err;
    }
}

module.exports = { sql, getConnection, getDb2Connection };
