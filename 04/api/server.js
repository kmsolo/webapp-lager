"use strict";

import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

// Öppna SQLite-databasen
const db = await open({
  filename: "./db/lager.sqlite",
  driver: sqlite3.Database,
});

// -----------------------------------------------------
// PRODUCTS
// -----------------------------------------------------

app.get("/products", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM products");
    res.json(rows);
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
      name,
      stock,
      location,
    );

    res.json({ message: "Product created" });
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const row = await db.get(
      "SELECT * FROM products WHERE id = ?",
      req.params.id,
    );
    res.json(row);
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
      name,
      stock,
      location,
      req.params.id,
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

// Hämta inleveranser med JOIN
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

// Skapa inleverans
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
      product_id,
      qty,
      delivery_date,
      comment,
    );

    const result = await db.run(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      qty,
      product_id,
    );

    if (result.changes === 0) {
      throw new Error("Product not found");
    }

    await db.exec("COMMIT");
    res.json({ message: "Delivery created" });
  } catch (err) {
    await db.exec("ROLLBACK").catch(() => {});
    console.error("POST /deliveries error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -----------------------------------------------------
// STARTA SERVERN
// -----------------------------------------------------

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
