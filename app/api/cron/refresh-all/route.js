export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fetchYoutubeStats } from "@/lib/youtube";
import { NextResponse } from "next/server";

// Dipanggil otomatis oleh Vercel Cron sesuai jadwal di vercel.json.
// Vercel menyertakan header Authorization: Bearer <CRON_SECRET> secara otomatis.
export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await db.execute(`SELECT id, youtube_video_id FROM videos`);

  let berhasil = 0;
  let gagal = 0;

  for (const video of rows) {
    try {
      const stats = await fetchYoutubeStats(video.youtube_video_id);
      if (!stats) { gagal++; continue; }

      await db.execute({
        sql: `UPDATE videos SET judul=?, views=?, likes=?, comments=?, updated_at=? WHERE id=?`,
        args: [stats.judul, stats.views, stats.likes, stats.comments, new Date().toISOString(), video.id],
      });
      berhasil++;
    } catch {
      gagal++;
    }
  }

  return NextResponse.json({ success: true, total: rows.length, berhasil, gagal });
}
