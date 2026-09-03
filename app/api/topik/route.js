export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/topik?jenis=provinsi|kabkota — daftar topik beserta klaster, dan jumlah video yang sudah ada di dalamnya
export async function GET(request) {
  const jenis = new URL(request.url).searchParams.get("jenis") || "provinsi";

  const { rows } = await db.execute({
    sql: `
      SELECT t.id, t.klaster, t.nama_topik,
        (SELECT COUNT(*) FROM videos v JOIN bawaslu_entities e ON e.id = v.entity_id WHERE e.topik_id = t.id) AS jumlah_video
      FROM topik t
      WHERE t.jenis = ?
      ORDER BY t.id ASC
    `,
    args: [jenis],
  });

  return NextResponse.json({ topik: rows });
}
