"use strict";

import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "https://dbwebbyearone.ddev.site:8443";
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(32).toString("hex");
  console.warn("JWT_SECRET saknas: slumpad nyckel används (inloggningar nollställs vid omstart).");
}

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

const db = await open({
  filename: "./db/lager.sqlite",
  driver: sqlite3.Database,
});

// -----------------------------------------------------
// SCHEMA (skapas om det saknas)
// -----------------------------------------------------
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
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (date('now'))
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price >= 0),
    status TEXT NOT NULL DEFAULT 'ny' CHECK (status IN ('ny','fakturerad')),
    created_at TEXT NOT NULL DEFAULT (date('now'))
  );
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id),
    customer TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (date('now'))
  );
`);

// Demoordrar om tabellen är tom
const { n: orderCount } = await db.get("SELECT COUNT(*) AS n FROM orders");
if (orderCount === 0) {
  const prods = await db.all("SELECT id FROM products LIMIT 4");
  const demo = [
    ["Bygg & Bo AB", 5, 199],
    ["Nordic Retail", 12, 349],
    ["Karlsson Verkstad", 2, 899],
    ["Café Solsidan", 8, 149],
  ];
  for (let i = 0; i < prods.length && i < demo.length; i++) {
    const [customer, qty, price] = demo[i];
    await db.run(
      "INSERT INTO orders (customer, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      customer, prods[i].id, qty, price,
    );
  }
}

// -----------------------------------------------------
// AUTH
// -----------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "2h",
  });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Inloggning krävs" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Ogiltig eller utgången inloggning" });
  }
}

app.post("/auth/register", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).json({ error: "Ogiltig e-postadress" });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: "Lösenordet måste vara 8–72 tecken" });
    }

    const hash = await bcrypt.hash(password, 10);
    try {
      await db.run(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        email, hash,
      );
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return res.status(409).json({ error: "E-postadressen används redan" });
      }
      throw err;
    }
    res.status(201).json({ message: "Användare skapad" });
  } catch (err) {
    console.error("POST /auth/register error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const user = await db.get("SELECT * FROM users WHERE email = ?", email);

    // Samma felmeddelande oavsett om användaren finns
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: "Fel e-post eller lösenord" });

    res.json({ token: signToken(user), email: user.email });
  } catch (err) {
    console.error("POST /auth/login error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Allt nedan kräver inloggning
app.use(["/products", "/deliveries", "/orders", "/invoices"], requireAuth);

// -----------------------------------------------------
// PRODUCTS
// -----------------------------------------------------
app.get("/products", async (req, res) => {
  try {
    res.json(await db.all("SELECT * FROM products"));
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const { name, stock, location } = req.body;
    await db.run(
      "INSERT INTO products (name, stock, location) VALUES (?, ?, ?)",
      name, stock, location,
    );
    res.json({ message: "Product created" });
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    res.json(await db.get("SELECT * FROM products WHERE id = ?", req.params.id));
  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const { name, stock, location } = req.body;
    await db.run(
      "UPDATE products SET name = ?, stock = ?, location = ? WHERE id = ?",
      name, stock, location, req.params.id,
    );
    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM products WHERE id = ?", req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------------------------------
// DELIVERIES
// -----------------------------------------------------
app.get("/deliveries", async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT deliveries.*, products.name AS product_name
      FROM deliveries
      JOIN products ON deliveries.product_id = products.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /deliveries error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/deliveries", async (req, res) => {
  try {
    const { product_id, amount, delivery_date, comment } = req.body;
    const qty = Number(amount);

    if (!product_id || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: "Invalid product or amount" });
    }

    await db.exec("BEGIN");
    await db.run(
      "INSERT INTO deliveries (product_id, amount, delivery_date, comment) VALUES (?, ?, ?, ?)",
      product_id, qty, delivery_date, comment,
    );
    const result = await db.run(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      qty, product_id,
    );
    if (result.changes === 0) throw new Error("Product not found");

    await db.exec("COMMIT");
    res.json({ message: "Delivery created" });
  } catch (err) {
    await db.exec("ROLLBACK").catch(() => {});
    console.error("POST /deliveries error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------------------------------
// ORDERS
// -----------------------------------------------------
const ORDER_SELECT = `
  SELECT orders.*, products.name AS product_name,
         orders.quantity * orders.unit_price AS total
  FROM orders
  JOIN products ON orders.product_id = products.id
`;

// GET /orders eller /orders?status=ny
app.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;
    if (status === undefined) {
      return res.json(await db.all(`${ORDER_SELECT} ORDER BY orders.id`));
    }
    if (!["ny", "fakturerad"].includes(status)) {
      return res.status(400).json({ error: "Ogiltig status" });
    }
    res.json(
      await db.all(`${ORDER_SELECT} WHERE orders.status = ? ORDER BY orders.id`, status),
    );
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const customer = String(req.body?.customer ?? "").trim();
    const productId = Number(req.body?.product_id);
    const quantity = Number(req.body?.quantity);
    const unitPrice = Number(req.body?.unit_price);

    const errors = [];
    if (customer.length < 2 || customer.length > 100) errors.push("Kund måste vara 2–100 tecken");
    if (!Number.isInteger(productId) || productId < 1) errors.push("Ogiltig produkt");
    if (!Number.isInteger(quantity) || quantity < 1) errors.push("Antal måste vara ett heltal över 0");
    if (!Number.isFinite(unitPrice) || unitPrice < 0) errors.push("Ogiltigt pris");
    if (errors.length > 0) return res.status(400).json({ error: errors.join(". ") });

    const product = await db.get("SELECT id FROM products WHERE id = ?", productId);
    if (!product) return res.status(404).json({ error: "Produkten finns inte" });

    // Status sätts alltid till 'ny' av servern
    const result = await db.run(
      "INSERT INTO orders (customer, product_id, quantity, unit_price, status) VALUES (?, ?, ?, ?, 'ny')",
      customer, productId, quantity, unitPrice,
    );
    const order = await db.get(`${ORDER_SELECT} WHERE orders.id = ?`, result.lastID);
    res.status(201).json(order);
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------------------------------
// INVOICES
// -----------------------------------------------------
const INVOICE_SELECT = `
  SELECT invoices.id, invoices.order_id, invoices.customer, invoices.amount,
         invoices.due_date, invoices.created_at,
         'F-' || strftime('%Y', invoices.created_at) || '-' || printf('%04d', invoices.id)
           AS invoice_number
  FROM invoices
`;

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

app.get("/invoices", async (req, res) => {
  try {
    res.json(await db.all(`${INVOICE_SELECT} ORDER BY invoices.id DESC`));
  } catch (err) {
    console.error("GET /invoices error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/invoices", async (req, res) => {
  const orderId = Number(req.body?.order_id);
  const dueDate = String(req.body?.due_date ?? "");

  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({ error: "Ogiltigt order-id" });
  }
  if (!isValidDate(dueDate)) {
    return res.status(400).json({ error: "Ogiltigt förfallodatum" });
  }

  let claimed = false;
  try {
    // Atomärt "claim": bara en request kan byta status ny -> fakturerad
    const claim = await db.run(
      "UPDATE orders SET status = 'fakturerad' WHERE id = ? AND status = 'ny'",
      orderId,
    );

    if (claim.changes === 0) {
      const exists = await db.get("SELECT id FROM orders WHERE id = ?", orderId);
      return exists
        ? res.status(409).json({ error: "Ordern är redan fakturerad" })
        : res.status(404).json({ error: "Ordern finns inte" });
    }
    claimed = true;

    // Beloppet räknas alltid ut på servern
    const order = await db.get(
      "SELECT customer, quantity * unit_price AS amount FROM orders WHERE id = ?",
      orderId,
    );
    const result = await db.run(
      "INSERT INTO invoices (order_id, customer, amount, due_date) VALUES (?, ?, ?, ?)",
      orderId, order.customer, order.amount, dueDate,
    );

    const invoice = await db.get(`${INVOICE_SELECT} WHERE invoices.id = ?`, result.lastID);
    res.status(201).json(invoice);
  } catch (err) {
    if (claimed) {
      await db.run("UPDATE orders SET status = 'ny' WHERE id = ?", orderId).catch(() => {});
    }
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({ error: "Ordern är redan fakturerad" });
    }
    console.error("POST /invoices error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------------------------------
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
