export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/entities?tipe=provinsi|kabkota&provinsi=Jawa+Timur&q=malang
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const tipe = params.get("tipe") || "provinsi";
  const provinsi = params.get("provinsi");
  const q = params.get("q");

  let sql = `SELECT id, nama, provinsi_nama FROM bawaslu_entities WHERE tipe = ?`;
  const args = [tipe];

  if (provinsi) {
    sql += ` AND provinsi_nama = ?`;
    args.push(provinsi);
  }
  if (q) {
    sql += ` AND nama LIKE ?`;
    args.push(`%${q}%`);
  }
  sql += ` ORDER BY nama ASC`;

  const { rows } = await db.execute({ sql, args });
  return NextResponse.json({ entities: rows });
}
