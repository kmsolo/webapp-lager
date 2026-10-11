import db from "./api/db.js";

console.log(db.name); // fullständig sökväg till filen som används
console.log(db.pragma("table_info(orders)").map((c) => c.name));
