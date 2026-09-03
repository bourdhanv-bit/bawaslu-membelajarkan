export function isAdminRequest(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  return decodeURIComponent(match[1]) === process.env.ADMIN_PASSWORD;
}
