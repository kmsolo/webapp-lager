const BASE_URL = "https://lager.emilfolino.se/v2";
const API_KEY = "d61f7ce6d568e4fda8ec6d3c708cc787";

export async function getProducts() {
  const response = await fetch(`${BASE_URL}/products?api_key=${API_KEY}`);

  if (!response.ok) {
    throw new Error(`HTTP-fel: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

export async function updateProduct(product) {
  const response = await fetch(`${BASE_URL}/product?api_key=${API_KEY}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error(`HTTP-fel: ${response.status}`);
  }

  return await response.json();
}
export async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/products?api_key=${API_KEY}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(`HTTP-fel: ${response.status}`);
  }

  return response;
}
