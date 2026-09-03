export const dynamic = "force-dynamic";

import { isAdminRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

// Client kirim header Authorization: Bearer <token> untuk validasi token
// yang tersimpan di localStorage masih cocok dengan ADMIN_PASSWORD saat ini.
export async function GET(request) {
  return NextResponse.json({ isAdmin: isAdminRequest(request) });
}
