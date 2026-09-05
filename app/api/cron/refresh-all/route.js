export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fetchYoutubeStats } from "@/lib/youtube";
import { NextResponse } from "next/server";

// Dipanggil otomatis oleh Google Apps Script (atau Vercel Cron) sesuai jadwal.
// Header Authorization: Bearer <CRON_SECRET> wajib ada.
export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await db.execute(`
    SELECT v.id, v.youtube_url, v.youtube_video_id, v.judul, e.nama AS nama_entitas
    FROM videos v
    JOIN bawaslu_entities e ON e.id = v.entity_id
  `);

  let berhasil = 0;
  const gagalDetail = [];

  for (const video of rows) {
    try {
      const stats = await fetchYoutubeStats(video.youtube_video_id);
      if (!stats) {
        gagalDetail.push({ id: video.id, entitas: video.nama_entitas, judul: video.judul, url: video.youtube_url, alasan: "Video tidak ditemukan di YouTube (mungkin dihapus/private)" });
        continue;
      }

      await db.execute({
        sql: `UPDATE videos SET judul=?, views=?, likes=?, comments=?, updated_at=? WHERE id=?`,
        args: [stats.judul, stats.views, stats.likes, stats.comments, new Date().toISOString(), video.id],
      });
      berhasil++;
    } catch (err) {
      gagalDetail.push({ id: video.id, entitas: video.nama_entitas, judul: video.judul, url: video.youtube_url, alasan: err.message || "Error tidak diketahui" });
    }
  }

  return NextResponse.json({ success: true, total: rows.length, berhasil, gagal: gagalDetail.length, detail_gagal: gagalDetail });
}
