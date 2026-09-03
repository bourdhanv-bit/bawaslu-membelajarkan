import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/import-entities  { tipe: 'kabkota', names: ["Bawaslu Kab. Malang", ...] }
export async function POST(request) {
  const { tipe, names } = await request.json();

  if (!tipe || !Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  let inserted = 0;
  for (const raw of names) {
    const nama = raw.trim();
    if (!nama) continue;
    const result = await db.execute({
      sql: `INSERT OR IGNORE INTO bawaslu_entities (tipe, nama) VALUES (?, ?)`,
      args: [tipe, nama],
    });
    if (result.rowsAffected > 0) inserted++;
  }

  return NextResponse.json({ success: true, inserted, total_diminta: names.length });
}
