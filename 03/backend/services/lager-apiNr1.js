"use strict";

import db from "../db/db.js";

const getDeliveriesStmt = db.prepare(`
    SELECT * FROM deliveries
    ORDER BY id DESC
`);

const createDeliveryStmt = db.prepare(`
    INSERT INTO deliveries (productId, quantity)
    VALUES (?, ?)
`);

export function getDeliveries() {
  return getDeliveriesStmt.all();
}

export function createDelivery(productId, quantity) {
  const info = createDeliveryStmt.run(productId, quantity);

  if (info.changes === 0) {
    throw new Error("Kunde inte spara inleveransen.");
  }

  return info.lastInsertRowid;
}
