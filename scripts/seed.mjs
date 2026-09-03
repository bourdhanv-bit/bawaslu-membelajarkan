import { createClient } from "@libsql/client";
import fs from "fs";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const PROVINSI = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Bengkulu", "Lampung",
  "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara",
  "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya",
];

async function main() {
  const schema = fs.readFileSync(new URL("../lib/schema.sql", import.meta.url), "utf-8");
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.execute(stmt);
  }

  for (const nama of PROVINSI) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO bawaslu_entities (tipe, nama) VALUES (?, ?)`,
      args: ["provinsi", `Bawaslu Provinsi ${nama}`],
    });
  }

  console.log(`Seed selesai: ${PROVINSI.length} Bawaslu Provinsi ditambahkan.`);
  console.log(`Untuk 514 Bawaslu Kab/Kota, gunakan fitur import CSV di halaman dashboard (tab Kelola Data).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
