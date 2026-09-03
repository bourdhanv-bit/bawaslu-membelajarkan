import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/entities?tipe=provinsi | kabkota
export async function GET(request) {
  const tipe = new URL(request.url).searchParams.get("tipe") || "provinsi";

  const { rows } = await db.execute({
    sql: `SELECT id, nama FROM bawaslu_entities WHERE tipe = ? ORDER BY nama ASC`,
    args: [tipe],
  });

  return NextResponse.json({ entities: rows });
}
