import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/provinsi-list — daftar nama provinsi unik, dipakai untuk dropdown filter kab/kota
export async function GET() {
  const { rows } = await db.execute(
    `SELECT DISTINCT provinsi_nama FROM bawaslu_entities WHERE tipe = 'kabkota' AND provinsi_nama IS NOT NULL ORDER BY provinsi_nama ASC`
  );
  return NextResponse.json({ provinsi: rows.map((r) => r.provinsi_nama) });
}
