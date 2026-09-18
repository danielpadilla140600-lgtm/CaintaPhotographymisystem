import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function runImport() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "cainta_photography_mis";
  const ssl = (process.env.DB_SSL === "true" || process.env.DB_SSL === "1") ? { rejectUnauthorized: false } : undefined;

  console.log(`[Import] Connecting to MySQL database at ${host}:${port}/${database}...`);

  const sqlFile = path.join(process.cwd(), "cainta_photography_mis.sql");
  if (!fs.existsSync(sqlFile)) {
    console.error(`[Error] SQL file not found: ${sqlFile}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFile, "utf-8");

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    ssl
  });

  console.log(`[Import] Connected successfully! Importing all tables and records...`);
  await connection.query(sqlContent);
  console.log(`[Import] SUCCESS: All tables and seed records are created and populated in '${database}'!`);
  await connection.end();
}

runImport().catch((err) => {
  console.error("\n[Import Error]:", err.message);
  process.exit(1);
});
