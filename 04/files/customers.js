// api/routes/customers.js
import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM customers ORDER BY name").all());
});

router.post("/", (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim() || null;
  const address = req.body.address?.trim() || null;

  if (!name) {
    return res.status(400).json({ error: "Namn måste anges." });
  }

  try {
    const result = db
      .prepare("INSERT INTO customers (name, email, address) VALUES (?, ?, ?)")
      .run(name, email, address);
    res.status(201).json(db.prepare("SELECT * FROM customers WHERE id = ?").get(result.lastInsertRowid));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Det finns redan en kund med det namnet." });
    }
    console.error("Kunde inte skapa kund:", error);
    res.status(500).json({ error: "Kunde inte skapa kunden." });
  }
});

export default router;
