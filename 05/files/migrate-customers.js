// Kör: npm run migrate:customers   (kan köras flera gånger)
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "..", "db", "lager.sqlite"));

// 1. Kundtabell
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    created_at TEXT NOT NULL DEFAULT (date('now'))
  )
`);

// 2. Koppling från order till kund
const cols = db.prepare("PRAGMA table_info(orders)").all().map((c) => c.name);
if (!cols.includes("customer_id")) {
  db.exec("ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES customers(id)");
  console.log("✓ Lade till orders.customer_id");
}

// 3. Skapa kunder från befintliga ordrar och koppla ihop dem
db.exec(`
  INSERT OR IGNORE INTO customers (name, address)
  SELECT customer, MAX(address) FROM orders GROUP BY customer;

  UPDATE orders
  SET customer_id = (SELECT id FROM customers WHERE customers.name = orders.customer)
  WHERE customer_id IS NULL;
`);

const n = db.prepare("SELECT COUNT(*) AS n FROM customers").get().n;
console.log(`✓ Klart. Antal kunder: ${n}`);
db.close();
