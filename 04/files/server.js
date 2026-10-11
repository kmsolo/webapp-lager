// api/server.js
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import productsRouter from "./routes/products.js";
import deliveriesRouter from "./routes/deliveries.js";
import ordersRouter from "./routes/orders.js";
import customersRouter from "./routes/customers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Använd routes
app.use("/products", productsRouter);
app.use("/deliveries", deliveriesRouter);
app.use("/orders", ordersRouter);
app.use("/customers", customersRouter);

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
