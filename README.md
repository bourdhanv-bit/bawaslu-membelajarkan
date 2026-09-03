# Bawaslu Membelajarkan — Vol 2

Dashboard ranking video pembelajaran YouTube dari 38 Bawaslu Provinsi dan
514 Bawaslu Kabupaten/Kota. Views, Likes, Comment diambil otomatis dari
YouTube Data API begitu link ditempel; Shares diisi manual (tidak tersedia
lewat API publik YouTube).

## Struktur folder

```
bawaslu-membelajarkan/
├── app/
│   ├── page.js                    # dashboard (2 tab: Provinsi & Kab/Kota)
│   ├── layout.js
│   ├── globals.css
│   └── api/
│       ├── entities/route.js       # daftar nama Bawaslu per tipe
│       ├── import-entities/route.js # import banyak nama sekaligus
│       └── videos/
│           ├── route.js            # list + tambah video baru
│           └── [id]/route.js       # update shares / refresh / hapus
├── lib/
│   ├── db.js                       # koneksi Turso
│   ├── schema.sql                  # skema database
│   └── youtube.js                  # ekstrak video id & fetch YouTube API
├── scripts/seed.mjs                # seed 38 nama Bawaslu Provinsi
├── .env.example
└── package.json
```

## 1. Buat database Turso

```bash
# install Turso CLI (sekali saja)
curl -sSfL https://get.tur.so/install.sh | bash

turso auth login
turso db create bawaslu-membelajarkan

# ambil connection URL
turso db show bawaslu-membelajarkan --url

# buat auth token
turso db tokens create bawaslu-membelajarkan
```

Catat hasil `--url` dan token di atas — dipakai di langkah 3.

## 2. Aktifkan YouTube Data API v3

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat/pilih project → cari **"YouTube Data API v3"** → **Enable**
3. **APIs & Services → Credentials → Create Credentials → API key**
4. Sarankan dibatasi (Restrict key) hanya untuk **YouTube Data API v3**

## 3. Setup lokal & seed data provinsi

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan URL & token Turso + API key YouTube dari langkah 1-2

npm run seed
```

Perintah `seed` otomatis membuat tabel, mengisi 38 nama Bawaslu Provinsi, dan
menarik data resmi 514 kabupaten/kota se-Indonesia dari API wilayah publik
([emsifa/api-wilayah-indonesia](https://github.com/emsifa/api-wilayah-indonesia))
untuk dibuatkan otomatis sebagai "Bawaslu Kabupaten/Kota [nama]". Proses ini
perlu koneksi internet dan makan waktu beberapa menit karena mengambil data
per provinsi satu per satu.

Kalau ada nama yang perlu dikoreksi manual (misalnya penamaan khusus di
daerahmu), tombol **"Import daftar Bawaslu"** di dashboard tetap tersedia
untuk menambah/melengkapi data kapan saja.

Jalankan lokal untuk uji coba:
```bash
npm run dev
```
Buka `http://localhost:3000`

## 4. Upload ke GitHub

```bash
git init
git add -A
git commit -m "Inisialisasi Bawaslu Membelajarkan Vol 2"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

## 5. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → login dengan akun GitHub kamu
2. **Add New → Project** → pilih repo yang baru di-push
4. Isi 5 environment variable dari `.env.example`:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `YOUTUBE_API_KEY`
   - `CRON_SECRET` — string acak bebas (mis. hasil `openssl rand -hex 16`), dipakai untuk mengamankan endpoint refresh otomatis
   - `ADMIN_PASSWORD` — password bebas untuk masuk sebagai admin di dashboard
5. Klik **Deploy**

## Mode publik vs admin

Yang tampil ke SEMUA pengunjung (tanpa login): kedua tabel ranking (Provinsi
& Kabupaten/Kota), bisa diurutkan, tapi tidak ada tombol tambah/edit/hapus.

Untuk menambah link video baru, klik **"Login admin"** di pojok kanan atas,
masukkan password yang sama dengan `ADMIN_PASSWORD`. Setelah login,
muncul tombol "+ Tambah video", "Import daftar Bawaslu", serta opsi
refresh/hapus per video. Login tersimpan di cookie selama 30 hari di
browser itu.

Setelah selesai, dapat URL `https://<nama-project>.vercel.app`. Setiap
`git push` ke `main` berikutnya otomatis ter-deploy ulang tanpa setup
tambahan apa pun.

## Ranking otomatis berubah setiap hari

File `vercel.json` sudah berisi **Vercel Cron Job** yang otomatis memanggil
`/api/cron/refresh-all` setiap hari jam 01:00 UTC (08:00 WIB), menarik ulang
Views/Like/Comment terbaru untuk SEMUA video sekaligus — jadi ranking
bergerak sendiri tanpa perlu ada yang klik apa pun.

Cron ini otomatis aktif begitu project di-deploy ke Vercel, tidak perlu
setup tambahan — asal environment variable `CRON_SECRET` sudah diisi di
langkah 4. Kalau butuh jadwal lebih sering dari sekali sehari, paket Vercel
gratis (Hobby) membatasi cron maksimal 1x/hari; jadwal lebih rapat butuh
paket Pro.

## Catatan
- Skor ranking = `views + likes + comments` (shares tidak dihitung karena
  datanya tidak bisa diverifikasi publik, hanya ditampilkan sebagai info).
- Tombol "refresh data" di tiap baris video menarik ulang Views/Like/Comment
  terbaru dari YouTube kapan saja diperlukan.
