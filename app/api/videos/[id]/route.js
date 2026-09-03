export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fetchYoutubeStats } from "@/lib/youtube";
import { isAdminRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

// PATCH /api/videos/:id   { refresh: true }
// Hanya admin yang boleh refresh data.
export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Hanya admin yang bisa melakukan ini" }, { status: 403 });
  }

  const { id } = params;
  const body = await request.json();

  if (body.refresh) {
    const { rows } = await db.execute({
      sql: `SELECT youtube_video_id FROM videos WHERE id = ?`,
      args: [id],
    });
    const video = rows[0];
    if (!video) return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 });

    const stats = await fetchYoutubeStats(video.youtube_video_id);
    if (!stats) return NextResponse.json({ error: "Gagal ambil data YouTube" }, { status: 502 });

    await db.execute({
      sql: `UPDATE videos SET judul=?, views=?, likes=?, comments=?, updated_at=? WHERE id=?`,
      args: [stats.judul, stats.views, stats.likes, stats.comments, new Date().toISOString(), id],
    });

    return NextResponse.json({ success: true, ...stats });
  }

  return NextResponse.json({ error: "Tidak ada perubahan yang dikirim" }, { status: 400 });
}

// DELETE /api/videos/:id
// Hanya admin yang boleh hapus.
export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Hanya admin yang bisa menghapus" }, { status: 403 });
  }
  await db.execute({ sql: `DELETE FROM videos WHERE id = ?`, args: [params.id] });
  return NextResponse.json({ success: true });
}
