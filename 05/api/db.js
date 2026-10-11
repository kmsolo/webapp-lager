// api/db.js
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Gå upp ett steg från api/ till 04/, sedan in i db/
const db = new Database(join(__dirname, "..", "db", "lager.sqlite"));

db.pragma("journal_mode = WAL");

export default db;
