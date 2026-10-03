const BASE = "https://dbwebbyearone.ddev.site:8443/webapp/mobil/api/orders.php";

export async function getPackedOrders() {
  const res = await fetch(`${BASE}?status=200`);
  return res.json();
}

export async function getDeliveredOrders() {
  const res = await fetch(`${BASE}?status=400`);
  return res.json();
}

export async function getOrder(id) {
  const res = await fetch(`${BASE}?id=${id}`);
  return res.json();
}

export async function updateOrder(id, data) {
  const res = await fetch(`${BASE}?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
