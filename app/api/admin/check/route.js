import { isAdminRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  return NextResponse.json({ isAdmin: isAdminRequest(request) });
}
