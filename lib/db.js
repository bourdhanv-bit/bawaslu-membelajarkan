import { createClient } from "@libsql/client";

// Koneksi dibuat lazy (baru saat benar-benar dipakai), bukan langsung saat
// file ini di-import. Ini penting karena Next.js mengevaluasi semua route
// API saat proses build untuk mengumpulkan metadata — kalau createClient()
// dipanggil langsung di top-level dan environment variable belum tersedia
// di tahap itu, build akan gagal total dengan error "Failed to collect
// page data".
let _client;

function getClient() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export const db = {
  execute: (...args) => getClient().execute(...args),
  batch: (...args) => getClient().batch(...args),
};
