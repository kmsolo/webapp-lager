// api/migrate-delivery.js
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "db", "lager.sqlite"));

try {
  // Lägg till nya kolumner om de inte finns
  db.exec(`
    ALTER TABLE orders ADD COLUMN delivered_latitude REAL
  `);
  console.log("✓ Lade till delivered_latitude");
} catch (e) {
  console.log("delivered_latitude finns redan");
}

try {
  db.exec(`
    ALTER TABLE orders ADD COLUMN delivered_longitude REAL
  `);
  console.log("✓ Lade till delivered_longitude");
} catch (e) {
  console.log("delivered_longitude finns redan");
}

try {
  db.exec(`
    ALTER TABLE orders ADD COLUMN delivery_photo TEXT
  `);
  console.log("✓ Lade till delivery_photo");
} catch (e) {
  console.log("delivery_photo finns redan");
}

try {
  db.exec(`
    ALTER TABLE orders ADD COLUMN delivered_at TEXT
  `);
  console.log("✓ Lade till delivered_at");
} catch (e) {
  console.log("delivered_at finns redan");
}

db.close();
console.log("Migration klar!");
