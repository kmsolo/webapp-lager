// api/routes/products.js
import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM products ORDER BY name");
  const products = stmt.all();
  res.json(products);
});

router.get("/:id", (req, res) => {
  const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
  const product = stmt.get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Produkten hittades inte." });
  }

  res.json(product);
});

router.post("/", (req, res) => {
  const { name, stock, location } = req.body;

  if (!name || !location || stock === undefined) {
    return res
      .status(400)
      .json({ error: "Fyll i produktnamn, lagersaldo och lagerplats." });
  }

  const stmt = db.prepare(
    "INSERT INTO products (name, stock, location) VALUES (?, ?, ?)",
  );
  const result = stmt.run(name, Number(stock), location);

  const newProduct = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(newProduct);
});

router.put("/:id", (req, res) => {
  const { name, stock, location } = req.body;

  if (!name || !location || stock === undefined) {
    return res
      .status(400)
      .json({ error: "Fyll i produktnamn, lagersaldo och lagerplats." });
  }

  const stmt = db.prepare(
    "UPDATE products SET name = ?, stock = ?, location = ? WHERE id = ?",
  );
  stmt.run(name, Number(stock), location, req.params.id);

  const updatedProduct = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(req.params.id);

  res.json(updatedProduct);
});

router.delete("/:id", (req, res) => {
  const stmt = db.prepare("DELETE FROM products WHERE id = ?");
  stmt.run(req.params.id);
  res.json({ message: `Produkt ${req.params.id} är raderad.` });
});

export default router;
