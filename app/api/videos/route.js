import { db } from "@/lib/db";
import { extractYoutubeId, fetchYoutubeStats } from "@/lib/youtube";
import { NextResponse } from "next/server";

// GET /api/videos?tipe=provinsi|kabkota&sort=skor|views|likes|comments|shares
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const tipe = params.get("tipe") || "provinsi";
  const sort = params.get("sort") || "skor";

  const validSort = ["skor", "views", "likes", "comments", "shares"];
  const sortCol = validSort.includes(sort) ? sort : "skor";

  const { rows } = await db.execute({
    sql: `
      SELECT
        v.id, v.youtube_url, v.judul, v.views, v.likes, v.comments, v.shares,
        (v.views + v.likes + v.comments) AS skor,
        e.nama AS nama_entitas
      FROM videos v
      JOIN bawaslu_entities e ON e.id = v.entity_id
      WHERE e.tipe = ?
      ORDER BY ${sortCol === "skor" ? "skor" : sortCol} DESC
    `,
    args: [tipe],
  });

  return NextResponse.json({ videos: rows });
}

// POST /api/videos  { entity_id, youtube_url, shares }
export async function POST(request) {
  const { entity_id, youtube_url, shares } = await request.json();

  if (!entity_id || !youtube_url) {
    return NextResponse.json({ error: "Pilih nama Bawaslu dan isi link YouTube" }, { status: 400 });
  }

  const videoId = extractYoutubeId(youtube_url);
  if (!videoId) {
    return NextResponse.json({ error: "Link YouTube tidak valid" }, { status: 400 });
  }

  const stats = await fetchYoutubeStats(videoId);
  if (!stats) {
    return NextResponse.json({ error: "Video tidak ditemukan di YouTube" }, { status: 404 });
  }

  const now = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO videos (entity_id, youtube_url, youtube_video_id, judul, views, likes, comments, shares, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [entity_id, youtube_url, videoId, stats.judul, stats.views, stats.likes, stats.comments, shares || 0, now],
  });

  return NextResponse.json({ success: true, ...stats });
}
