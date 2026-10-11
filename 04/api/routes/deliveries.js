// api/routes/deliveries.js
import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const stmt = db.prepare(`
    SELECT 
      deliveries.id,
      deliveries.product_id,
      deliveries.amount,
      deliveries.delivery_date,
      deliveries.comment,
      products.name AS product_name
    FROM deliveries
    JOIN products ON deliveries.product_id = products.id
    ORDER BY deliveries.delivery_date DESC
  `);
  const deliveries = stmt.all();
  res.json(deliveries);
});

router.post("/", (req, res) => {
  const { product_id, amount, delivery_date, comment } = req.body;

  if (!product_id || !amount || !delivery_date) {
    return res
      .status(400)
      .json({ error: "Fyll i produkt, antal och leveransdatum." });
  }

  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(product_id);

  if (!product) {
    return res.status(404).json({ error: "Produkten hittades inte." });
  }

  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (product_id, amount, delivery_date, comment)
    VALUES (?, ?, ?, ?)
  `);

  const updateProduct = db.prepare(`
    UPDATE products SET stock = stock + ? WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    insertDelivery.run(
      product_id,
      Number(amount),
      delivery_date,
      comment || "",
    );
    updateProduct.run(Number(amount), product_id);
  });

  transaction();

  const newDelivery = db
    .prepare("SELECT * FROM deliveries WHERE id = last_insert_rowid()")
    .get();

  res.status(201).json(newDelivery);
});

export default router;
