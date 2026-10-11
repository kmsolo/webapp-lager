// api/routes/customers.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// Kunder + antal ordrar (så att appen vet om en kund går att ta bort)
const SELECT_CUSTOMER = `
  SELECT customers.*,
         (SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id) AS order_count
  FROM customers
`;

function cleanBody(body) {
  return {
    name: body.name?.trim(),
    email: body.email?.trim() || null,
    address: body.address?.trim() || null,
  };
}

// Read: lista
router.get("/", (req, res) => {
  res.json(db.prepare(SELECT_CUSTOMER + " ORDER BY name").all());
});

// Read: en kund
router.get("/:id", (req, res) => {
  const customer = db.prepare(SELECT_CUSTOMER + " WHERE customers.id = ?").get(req.params.id);
  if (!customer) return res.status(404).json({ error: "Kunden finns inte." });
  res.json(customer);
});

// Create
router.post("/", (req, res) => {
  const { name, email, address } = cleanBody(req.body);
  if (!name) return res.status(400).json({ error: "Namn måste anges." });

  try {
    const result = db
      .prepare("INSERT INTO customers (name, email, address) VALUES (?, ?, ?)")
      .run(name, email, address);
    res
      .status(201)
      .json(db.prepare(SELECT_CUSTOMER + " WHERE customers.id = ?").get(result.lastInsertRowid));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Det finns redan en kund med det namnet." });
    }
    console.error("Kunde inte skapa kund:", error);
    res.status(500).json({ error: "Kunde inte skapa kunden." });
  }
});

// Update
router.put("/:id", (req, res) => {
  const { name, email, address } = cleanBody(req.body);
  if (!name) return res.status(400).json({ error: "Namn måste anges." });

  const existing = db.prepare("SELECT id FROM customers WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Kunden finns inte." });

  try {
    const update = db.transaction(() => {
      db.prepare("UPDATE customers SET name = ?, email = ?, address = ? WHERE id = ?").run(
        name,
        email,
        address,
        req.params.id,
      );
      // orders.customer är en kopia av namnet, håll den i synk
      db.prepare("UPDATE orders SET customer = ? WHERE customer_id = ?").run(name, req.params.id);
    });
    update();
    res.json(db.prepare(SELECT_CUSTOMER + " WHERE customers.id = ?").get(req.params.id));
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Det finns redan en kund med det namnet." });
    }
    console.error("Kunde inte uppdatera kund:", error);
    res.status(500).json({ error: "Kunde inte uppdatera kunden." });
  }
});

// Delete: inte om kunden har ordrar
router.delete("/:id", (req, res) => {
  const customer = db.prepare(SELECT_CUSTOMER + " WHERE customers.id = ?").get(req.params.id);
  if (!customer) return res.status(404).json({ error: "Kunden finns inte." });

  if (customer.order_count > 0) {
    return res.status(409).json({
      error: `Kunden har ${customer.order_count} order(rar) och kan inte tas bort.`,
    });
  }

  db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
  res.json({ deleted: Number(req.params.id) });
});

export default router;
