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
  if (host === "127.0.0.1" || host === "localhost") {
    console.warn("\n⚠️  [PAALALA]: Naka-konekta ka ngayon sa LOCALHOST (127.0.0.1 / XAMPP).");
    console.warn("   Kung gusto mong i-import ang database para sa RENDER, palitan muna ang DB_HOST sa iyong .env gamit ang credentials ng iyong Cloud Database!\n");
  }

  const sqlFile = path.join(process.cwd(), "cainta_photography_mis.sql");
  if (!fs.existsSync(sqlFile)) {
    console.error(`[Error] SQL file not found: ${sqlFile}`);
    process.exit(1);
  }

  let sqlContent = fs.readFileSync(sqlFile, "utf-8");

  // Make queries idempotent so they don't fail if tables or rows already exist
  sqlContent = sqlContent
    .replace(/CREATE TABLE `/gi, "CREATE TABLE IF NOT EXISTS `")
    .replace(/INSERT INTO `/gi, "INSERT IGNORE INTO `");

  // Disable FK checks during bulk import to avoid constraint ordering conflicts
  const wrappedSql = `
    SET FOREIGN_KEY_CHECKS = 0;
    ${sqlContent}
    SET FOREIGN_KEY_CHECKS = 1;
  `;

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    ssl
  });

  console.log(`[Import] Connected successfully! Importing tables and seed data...`);
  await connection.query(wrappedSql);
  console.log(`\n🎉 [Import] SUCCESS: Lahat ng tables at seed data ay matagumpay na na-import sa '${database}' (${host})!`);
  await connection.end();
}

runImport().catch((err) => {
  console.error("\n[Import Error]:", err.message);
  process.exit(1);
});
