import { NextResponse } from "next/server";

// Login sekarang tidak pakai cookie sama sekali — client menyimpan token
// (password itu sendiri) di localStorage dan mengirimkannya sebagai
// header Authorization di tiap request admin. Lebih sederhana dan tidak
// bergantung pada perilaku cookie (secure/SameSite) yang beda-beda antar
// browser/lingkungan.
export async function POST(request) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  return NextResponse.json({ success: true, token: password });
}
