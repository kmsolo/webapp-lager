import Database from "better-sqlite3";
import { readFile } from "node:fs/promises";

const db = new Database("./database.sqlite");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    stock INTEGER NOT NULL,
    location TEXT NOT NULL
  );
`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO products (id, name, stock, location)
  VALUES (@id, @name, @stock, @location)
`);

async function main() {
  const raw = await readFile("./products.seed.json", "utf8");
  const products = JSON.parse(raw);

  const transaction = db.transaction((items) => {
    for (const product of items) {
      insert.run(product);
    }
  });

  transaction(products);

  console.log(`Lade in ${products.length} produkter i SQLite`);
}

main().catch((error) => {
  console.error("Kunde inte läsa in seed:", error);
  process.exit(1);
});
