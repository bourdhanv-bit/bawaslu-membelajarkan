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

const WILAYAH_API = "https://emsifa.github.io/api-wilayah-indonesia/api";

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function toBawasluName(rawName) {
  const isKota = rawName.startsWith("KOTA ");
  const isKab = rawName.startsWith("KABUPATEN ");
  const jenis = isKota ? "Kota" : isKab ? "Kabupaten" : "";
  const sisa = rawName.replace(/^KABUPATEN |^KOTA /, "");
  return `Bawaslu ${jenis} ${toTitleCase(sisa)}`.trim();
}

async function main() {
  const schema = fs.readFileSync(new URL("../lib/schema.sql", import.meta.url), "utf-8");
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.execute(stmt);
  }

  // Migrasi: tambah kolom provinsi_nama kalau database sudah pernah di-seed sebelum kolom ini ada.
  try {
    await db.execute(`ALTER TABLE bawaslu_entities ADD COLUMN provinsi_nama TEXT`);
    console.log("Migrasi: kolom provinsi_nama ditambahkan.");
  } catch (e) {
    // Kolom sudah ada — aman diabaikan.
  }

  for (const nama of PROVINSI) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO bawaslu_entities (tipe, nama) VALUES (?, ?)`,
      args: ["provinsi", `Bawaslu Provinsi ${nama}`],
    });
  }
  console.log(`Seed selesai: ${PROVINSI.length} Bawaslu Provinsi ditambahkan.`);

  const provRes = await fetch(`${WILAYAH_API}/provinces.json`);
  const provinces = await provRes.json();

  let totalKabKota = 0;

  for (const prov of provinces) {
    const namaProvinsi = toTitleCase(prov.name);
    const res = await fetch(`${WILAYAH_API}/regencies/${prov.id}.json`);
    const regencies = await res.json();

    for (const r of regencies) {
      const nama = toBawasluName(r.name);
      await db.execute({
        sql: `INSERT INTO bawaslu_entities (tipe, nama, provinsi_nama) VALUES (?, ?, ?)
              ON CONFLICT(nama) DO UPDATE SET provinsi_nama = excluded.provinsi_nama`,
        args: ["kabkota", nama, namaProvinsi],
      });
      totalKabKota++;
    }
    console.log(`  ${prov.name}: ${regencies.length} kab/kota`);
  }

  console.log(`Seed selesai: ${totalKabKota} Bawaslu Kabupaten/Kota ditambahkan.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
