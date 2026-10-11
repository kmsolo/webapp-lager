// api/routes/orders.js
import express from "express";
import db from "../db.js";

const router = express.Router();

const SELECT = `
  SELECT orders.*,
         products.name AS product_name,
         products.location AS product_location
  FROM orders
  JOIN products ON orders.product_id = products.id
`;

router.get("/", (req, res) => {
  const { status } = req.query;
  let sql = SELECT;
  const params = [];
  if (status) {
    sql += " WHERE orders.status = ?";
    params.push(status);
  }
  sql += " ORDER BY orders.created_at DESC, orders.id DESC";
  res.json(db.prepare(sql).all(...params));
});

// Skapa ny order från kund + produkt
router.post("/", (req, res) => {
  const { customer_id, product_id } = req.body;
  const quantity = Number(req.body.quantity);
  const unit_price = Number(req.body.unit_price);

  if (!customer_id || !product_id) {
    return res.status(400).json({ error: "Kund och produkt måste väljas." });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Antal måste vara ett heltal större än 0." });
  }
  if (!Number.isFinite(unit_price) || unit_price < 0) {
    return res.status(400).json({ error: "Pris måste vara 0 eller mer." });
  }

  const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(customer_id);
  if (!customer) return res.status(404).json({ error: "Kunden finns inte." });

  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(product_id);
  if (!product) return res.status(404).json({ error: "Produkten finns inte." });

  // Leveransadress: den som skickas med, annars kundens egen
  const address = req.body.address?.trim() || customer.address || null;

  try {
    const result = db
      .prepare(
        `INSERT INTO orders (customer, customer_id, product_id, quantity, unit_price, status, address)
         VALUES (?, ?, ?, ?, ?, 'ny', ?)`,
      )
      .run(customer.name, customer.id, product_id, quantity, unit_price, address);

    const order = db.prepare(SELECT_ORDER + " WHERE orders.id = ?").get(result.lastInsertRowid);
    res.status(201).json(order);
  } catch (error) {
    console.error("Kunde inte skapa order:", error);
    res.status(500).json({ error: "Kunde inte skapa ordern. Har du kört npm run migrate:customers?" });
  }
});

router.get("/:id", (req, res) => {
  const order = db.prepare(SELECT + " WHERE orders.id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "Ordern hittades inte." });
  res.json(order);
});

router.put("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status måste anges." });
  try {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  } catch (e) {
    return res.status(400).json({ error: "Ogiltig status." });
  }
  res.json(db.prepare(SELECT + " WHERE orders.id = ?").get(req.params.id));
});

// Leverera: GPS + foto, status -> levererad
router.put("/:id/deliver", (req, res) => {
  const { latitude, longitude, photo_url } = req.body;
  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: "GPS-koordinater krävs." });
  }
  try {
    const result = db
      .prepare(
        `UPDATE orders
         SET status = 'levererad', delivered_latitude = ?, delivered_longitude = ?,
             delivery_photo = ?, delivered_at = datetime('now')
         WHERE id = ? AND status = 'packad'`,
      )
      .run(latitude, longitude, photo_url || null, req.params.id);
    if (result.changes === 0) {
      return res.status(409).json({ error: "Ordern finns inte eller är inte packad." });
    }
    res.json(db.prepare(SELECT + " WHERE orders.id = ?").get(req.params.id));
  } catch (error) {
    console.error("Kunde inte uppdatera order:", error);
    res.status(500).json({ error: "Kunde inte uppdatera ordern. Har du kört npm run migrate?" });
  }
});

export default router;
