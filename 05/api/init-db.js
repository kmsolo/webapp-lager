// Skapar db/lager.sqlite med tabellerna products och deliveries om de saknas.
// Kör: npm run initdb
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const db = await open({ filename: "./db/lager.sqlite", driver: sqlite3.Database });

await db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    location TEXT
  );
  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id),
    amount INTEGER NOT NULL,
    delivery_date TEXT,
    comment TEXT
  );
`);

console.log("Databasen är klar: db/lager.sqlite");
await db.close();
