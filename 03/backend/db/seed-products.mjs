import { writeFile } from "node:fs/promises";

const products = [
  "Kaffebryggare",
  "Vattenkokare",
  "Mixer",
  "Brödrost",
  "Dammsugare",
  "Mikrovågsugn",
  "Högtalare",
  "Skärm",
  "Tangentbord",
  "Mus",
  "Lampa",
  "Stol",
  "Bord",
  "Hylla",
  "Förvaring",
  "Väska",
  "Ryggsäck",
  "Jacka",
  "Skor",
  "Tröja",
];

const locations = [
  "A1-01",
  "A1-02",
  "A2-01",
  "B1-01",
  "B2-03",
  "C1-04",
  "C2-02",
  "D1-05",
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateProducts(count = 200) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `${randomItem(products)} ${index + 1}`,
    stock: Math.floor(Math.random() * 100),
    location: randomItem(locations),
  }));
}

async function main() {
  const seed = generateProducts(200);

  await writeFile(
    "./products.seed.json",
    JSON.stringify(seed, null, 2),
    "utf8",
  );

  console.log(`Sparade ${seed.length} produkter i products.seed.json`);
}

main().catch((error) => {
  console.error("Kunde inte skapa seed:", error);
  process.exit(1);
});
