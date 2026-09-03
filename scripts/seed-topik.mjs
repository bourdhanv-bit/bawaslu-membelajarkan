import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ============================================================
// LAMPIRAN I & III — 16 Topik / 6 Klaster untuk Bawaslu Provinsi
// ============================================================
const TOPIK_PROVINSI = [
  { klaster: "Desain Sistem Pemilu", topik: "Penataan Daerah Pemilihan (Dapil): Prinsip Kesetaraan Nilai Suara, Besaran Dapil, Metode Penataan dan Tantangan Pengawasan", provinsi: ["Kalimantan Barat", "Papua", "Sumatera Utara"] },
  { klaster: "Desain Sistem Pemilu", topik: "Desain Sistem Pemilu: Presidential Threshold, Parliamentary Threshold, Sistem Kepartaian dan Representasi Politik", provinsi: ["Lampung", "Riau"] },
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Perencanaan dan Manajemen Tahapan Pemilu: Desain Tahapan, Kerangka Regulasi, dan Kesiapan Penyelenggaraan", provinsi: ["DI Yogyakarta", "Sulawesi Tengah", "Sumatera Selatan"] },
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Pemutakhiran Data Pemilih: Otomasi, Interoperabilitas Data, Deduplikasi, dan Perlindungan Data Pribadi", provinsi: ["Jawa Timur", "Sulawesi Tenggara"] },
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Manajemen Logistik Pemilu: Perencanaan, Distribusi, Pengendalian, Mitigasi Resiko dan Akuntabilitas", provinsi: ["Kepulauan Riau", "Maluku", "Papua Barat"] },
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Tata Kelola Kampanye dan Dana Kampanye: Regulasi, Transparansi, Pengawasan, dan Akuntabilitas", provinsi: ["Kalimantan Tengah", "Nusa Tenggara Barat"] },
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Tata Kelola Pemungutan, Penghitungan, Rekapitulasi, dan Penetapan Hasil Pemilu", provinsi: ["Kepulauan Bangka Belitung", "Kalimantan Utara", "Papua Pegunungan"] },
  { klaster: "Integritas Pemilu", topik: "Netralitas ASN Dan Kepala Desa: Tantangan Integritas Pemilu dan Reformasi Penegakan Hukum", provinsi: ["Banten", "Jawa Barat"] },
  { klaster: "Integritas Pemilu", topik: "Politik Uang dalam Pemilu: Anatomi Transaksi Elektoral, Modus, dan Tantangan Penegakan Hukum", provinsi: ["Maluku Utara", "Kalimantan Selatan"] },
  { klaster: "Integritas Pemilu", topik: "Etika Penyelenggara Pemilu: Integritas, Independensi, dan Pembelajaran dari Putusan DKPP Menuju Pembinaan SDM Pengawas Pemilu", provinsi: ["Papua Selatan", "Sulawesi Barat"] },
  { klaster: "Pemilu Inklusif", topik: "Penyelenggaraan dan Pengawasan Pemilu pada Wilayah Khusus: Aceh, Papua, Luar Negeri, dan Daerah 3T", provinsi: ["DKI Jakarta", "Papua Tengah", "Aceh"] },
  { klaster: "Pemilu Inklusif", topik: "Representasi Politik Perempuan, Masyarakat Adat, Penyandang Disabilitas, dan Kelompok Rentan", provinsi: ["Bali", "Papua Barat Daya"] },
  { klaster: "Transformasi Digital Pemilu", topik: "Peta Jalan Digitalisasi Pemilu: Tata Kelola Data, Keamanan Siber, Auditabilitas Sistem, dan Kesiapan Kelembagaan", provinsi: ["Jawa Tengah", "Jambi", "Sumatera Barat"] },
  { klaster: "Penegakan Hukum Pemilu", topik: "Sistem Keadilan Pemilu: Evaluasi Penanganan Pelanggaran Administratif dan Tindak Pidana serta Penyelesaian Sengketa Proses", provinsi: ["Nusa Tenggara Timur", "Sulawesi Selatan"] },
  { klaster: "Penegakan Hukum Pemilu", topik: "Reformasi Arsitektur Penegakan Hukum Pemilu: Harmonisasi Regulasi, Pembagian Kewenangan, dan Desain Kelembagaan", provinsi: ["Gorontalo", "Kalimantan Timur"] },
  { klaster: "Penegakan Hukum Pemilu", topik: "Akuntabilitas Kinerja Penegakan Hukum Pemilu: Independensi, Profesionalitas, Transparansi, dan Kepercayaan Publik", provinsi: ["Bengkulu", "Sulawesi Utara"] },
];

// ============================================================
// LAMPIRAN II & IV — 32 Topik / 7 Klaster untuk Bawaslu Kab/Kota
// Format tiap entitas: [nama tanpa prefix, provinsi]
// ============================================================
const TOPIK_KABKOTA = [
  { klaster: "Desain Sistem Pemilu", topik: "Implementasi Penataan Daerah Pemilihan: Kesetaraan Nilai Suara dan Kualitas Representasi Politik Daerah", entitas: [
    ["Kab. Bone Bolango","Gorontalo"],["Kab. Sragen","Jawa Tengah"],["Kab. Demak","Jawa Tengah"],["Kab. Hulu Sungai Utara","Kalimantan Selatan"],["Kab. Lombok Timur","Nusa Tenggara Barat"],["Kab. Mamasa","Sulawesi Barat"],["Kab. Manokwari Selatan","Papua Barat"],["Kab. Ogan Ilir","Sumatera Selatan"],["Kab. Rembang","Jawa Tengah"],["Kab. Sukabumi","Jawa Barat"],["Kab. Sumba Barat Daya","Nusa Tenggara Timur"],["Kab. Tambrauw","Papua Barat Daya"],["Kab. Tanggamus","Lampung"],["Kab. Tapanuli Selatan","Sumatera Utara"],["Kota Denpasar","Bali"],["Kota Lhokseumawe","Aceh"],
  ]},
  { klaster: "Desain Sistem Pemilu", topik: "Implementasi Sistem Konversi Suara dan Alokasi Kursi dalam Pemilu Daerah", entitas: [
    ["Kab. Bangka Tengah","Kepulauan Bangka Belitung"],["Kab. Belitung","Kepulauan Bangka Belitung"],["Kab. Grobogan","Jawa Tengah"],["Kab. Landak","Kalimantan Barat"],["Kab. Merangin","Jambi"],["Kab. Morowali Utara","Sulawesi Tengah"],["Kab. Muara Enim","Sumatera Selatan"],["Kab. Muna Barat","Sulawesi Tenggara"],["Kab. Ogan Komering Ulu Selatan","Sumatera Selatan"],["Kab. Sorong","Papua Barat Daya"],["Kab. Tapanuli Tengah","Sumatera Utara"],["Kab. Toraja Utara","Sulawesi Selatan"],["Kota Jambi","Jambi"],["Kota Makassar","Sulawesi Selatan"],["Kota Sukabumi","Jawa Barat"],["Kab. Temanggung","Jawa Tengah"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Tata Kelola Tahapan Pemilu di Daerah: Permasalahan, Praktik Baik, Manajemen Resiko dan Evaluasi Penyelenggaraan", entitas: [
    ["Kab. Aceh Besar","Aceh"],["Kab. Kolaka","Sulawesi Tenggara"],["Kab. Konawe Selatan","Sulawesi Tenggara"],["Kab. Kubu Raya","Kalimantan Barat"],["Kab. Labuhan Batu Selatan","Sumatera Utara"],["Kab. Mamuju Tengah","Sulawesi Barat"],["Kab. Manggarai Barat","Nusa Tenggara Timur"],["Kab. Mesuji","Lampung"],["Kab. Rokan Hilir","Riau"],["Kab. Sorong Selatan","Papua Barat Daya"],["Kota Cilegon","Banten"],["Kota Jakarta Barat","DKI Jakarta"],["Kota Mataram","Nusa Tenggara Barat"],["Kota Parepare","Sulawesi Selatan"],["Kota Ternate","Maluku Utara"],["Kota Yogyakarta","DI Yogyakarta"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Pemutakhiran Data Pemilih: Analisis Permasalahan dan Strategi Peningkatan Kualitas Daftar Pemilih", entitas: [
    ["Kab. Agam","Sumatera Barat"],["Kab. Bolaang Mongondow","Sulawesi Utara"],["Kab. Deli Serdang","Sumatera Utara"],["Kab. Hulu Sungai Selatan","Kalimantan Selatan"],["Kab. Lumajang","Jawa Timur"],["Kab. Maros","Sulawesi Selatan"],["Kab. Musi Banyuasin","Sumatera Selatan"],["Kab. Ogan Komering Ulu Timur","Sumatera Selatan"],["Kab. Ponorogo","Jawa Timur"],["Kab. Tanah Datar","Sumatera Barat"],["Kota Baubau","Sulawesi Tenggara"],["Kota Bogor","Jawa Barat"],["Kota Depok","Jawa Barat"],["Kota Lubuklinggau","Sumatera Selatan"],["Kota Singkawang","Kalimantan Barat"],["Kota Tebing Tinggi","Sumatera Utara"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Tata Kelola Verifikasi Partai Politik Peserta Pemilu: Mitigasi Risiko, Kepatuhan Persyaratan, dan Efektivitas Pengawasan", entitas: [
    ["Kab. Bengkayang","Kalimantan Barat"],["Kab. Bondowoso","Jawa Timur"],["Kab. Buru","Maluku"],["Kab. Donggala","Sulawesi Tengah"],["Kab. Flores Timur","Nusa Tenggara Timur"],["Kab. Luwu","Sulawesi Selatan"],["Kab. Mahakam Hulu","Kalimantan Timur"],["Kab. Mamberamo Tengah","Papua Pegunungan"],["Kab. Padang Lawas","Sumatera Utara"],["Kab. Samosir","Sumatera Utara"],["Kab. Sukoharjo","Jawa Tengah"],["Kab. Tana Tidung","Kalimantan Utara"],["Kab. Tanah Bumbu","Kalimantan Selatan"],["Kab. Tolikara","Papua Pegunungan"],["Kota Payakumbuh","Sumatera Barat"],["Kota Tomohon","Sulawesi Utara"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Pengawasan Akuntabilitas Dana Kampanye: Transparansi Pelaporan, Audit Kepatuhan, dan Verifikasi Berbasis Data", entitas: [
    ["Kab. Aceh Tengah","Aceh"],["Kab. Badung","Bali"],["Kab. Bangka","Kepulauan Bangka Belitung"],["Kab. Bekasi","Jawa Barat"],["Kab. Indragiri Hulu","Riau"],["Kab. Kepahiang","Bengkulu"],["Kab. Klungkung","Bali"],["Kab. Kota Baru","Kalimantan Selatan"],["Kab. Kotawaringin Barat","Kalimantan Tengah"],["Kab. Malinau","Kalimantan Utara"],["Kab. Pacitan","Jawa Timur"],["Kab. Raja Ampat","Papua Barat Daya"],["Kab. Sambas","Kalimantan Barat"],["Kab. Sekadau","Kalimantan Barat"],["Kab. Sumba Tengah","Nusa Tenggara Timur"],["Kab. Tapin","Kalimantan Selatan"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Manajemen Logistik Pemilu di Daerah: Distribusi, Pengendalian Mutu, dan Mitigasi Risiko", entitas: [
    ["Kab. Banggai Kepulauan","Sulawesi Tengah"],["Kab. Barito Selatan","Kalimantan Tengah"],["Kab. Bener Meriah","Aceh"],["Kab. Bengkulu Tengah","Bengkulu"],["Kab. Kepulauan Mentawai","Sumatera Barat"],["Kab. Kepulauan Sula","Maluku Utara"],["Kab. Maluku Barat Daya","Maluku"],["Kab. Mamberamo Raya","Papua"],["Kab. Nagekeo","Nusa Tenggara Timur"],["Kab. Nduga","Papua Pegunungan"],["Kab. Nunukan","Kalimantan Utara"],["Kab. Pegunungan Bintang","Papua Pegunungan"],["Kab. Takalar","Sulawesi Selatan"],["Kab. Yahukimo","Papua Pegunungan"],["Kab. Kepulauan Seribu","DKI Jakarta"],["Kota Tidore Kepulauan","Maluku Utara"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Tata Kelola Pemungutan dan Penghitungan Suara: Integritas, Pengendalian, dan Akuntabilitas", entitas: [
    ["Kab. Aceh Selatan","Aceh"],["Kab. Bogor","Jawa Barat"],["Kab. Buton","Sulawesi Tenggara"],["Kab. Ciamis","Jawa Barat"],["Kab. Enrekang","Sulawesi Selatan"],["Kab. Gunung Kidul","DI Yogyakarta"],["Kab. Konawe Utara","Sulawesi Tenggara"],["Kab. Lebak","Banten"],["Kab. Mappi","Papua Selatan"],["Kab. Probolinggo","Jawa Timur"],["Kab. Purbalingga","Jawa Tengah"],["Kab. Purworejo","Jawa Tengah"],["Kota Bekasi","Jawa Barat"],["Kota Bengkulu","Bengkulu"],["Kota Bontang","Kalimantan Timur"],["Kota Tegal","Jawa Tengah"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Transformasi Rekapitulasi Hasil Pemilu: Rekonsiliasi Data, Interoperabilitas Sistem, dan Integritas Hasil Pemilu", entitas: [
    ["Kab. Aceh Tenggara","Aceh"],["Kab. Dharmasraya","Sumatera Barat"],["Kab. Dogiyai","Papua Tengah"],["Kab. Madiun","Jawa Timur"],["Kab. Minahasa Utara","Sulawesi Utara"],["Kab. Sarolangun","Jambi"],["Kab. Semarang","Jawa Tengah"],["Kab. Sinjai","Sulawesi Selatan"],["Kab. Sumbawa Barat","Nusa Tenggara Barat"],["Kab. Supiori","Papua"],["Kota Binjai","Sumatera Utara"],["Kota Bitung","Sulawesi Utara"],["Kota Cirebon","Jawa Barat"],["Kota Madiun","Jawa Timur"],["Kab. Wonogiri","Jawa Tengah"],["Kota Sungai Penuh","Jambi"],
  ]},
  { klaster: "Tata Kelola Tahapan Pemilu", topik: "Manajemen Pemungutan Suara Ulang, Lanjutan, dan Susulan: PSU, PSL, PSS, Tindak Lanjut Putusan, dan Evaluasi", entitas: [
    ["Kab. Banggai","Sulawesi Tengah"],["Kab. Bangka Barat","Kepulauan Bangka Belitung"],["Kab. Barito Utara","Kalimantan Tengah"],["Kab. Bengkulu Selatan","Bengkulu"],["Kab. Boven Digoel","Papua Selatan"],["Kab. Empat Lawang","Sumatera Selatan"],["Kab. Kutai Kartanegara","Kalimantan Timur"],["Kab. Magetan","Jawa Timur"],["Kab. Parigi Moutong","Sulawesi Tengah"],["Kab. Pasaman","Sumatera Barat"],["Kab. Pesawaran","Lampung"],["Kab. Siak","Riau"],["Kab. Tasikmalaya","Jawa Barat"],["Kota Banjar Baru","Kalimantan Selatan"],["Kota Palopo","Sulawesi Selatan"],["Kota Palu","Sulawesi Tengah"],
  ]},
  { klaster: "Integritas Pemilu", topik: "Netralitas ASN dan Kepala Desa: Penyalahgunaan Jabatan, Mobilisasi Birokrasi, dan Efektivitas Penegakan Sanksi", entitas: [
    ["Kab. Aceh Tamiang","Aceh"],["Kab. Bangka Selatan","Kepulauan Bangka Belitung"],["Kab. Banyuwangi","Jawa Timur"],["Kab. Boalemo","Gorontalo"],["Kab. Melawi","Kalimantan Barat"],["Kab. Pakpak Bharat","Sumatera Utara"],["Kab. Pekalongan","Jawa Tengah"],["Kab. Sarmi","Papua"],["Kab. Serang","Banten"],["Kab. Simeulue","Aceh"],["Kota Salatiga","Jawa Tengah"],["Kab. Karanganyar","Jawa Tengah"],["Kota Bima","Nusa Tenggara Barat"],["Kota Cimahi","Jawa Barat"],["Kota Malang","Jawa Timur"],["Kota Samarinda","Kalimantan Timur"],
  ]},
  { klaster: "Integritas Pemilu", topik: "Politik Uang dan Politisasi Bantuan Sosial: Analisis Modus, Tantangan Pembuktian, dan Strategi Pencegahan dan Penindakan", entitas: [
    ["Kab. Bandung Barat","Jawa Barat"],["Kab. Gayo Lues","Aceh"],["Kab. Halmahera Selatan","Maluku Utara"],["Kab. Kerinci","Jambi"],["Kab. Kebumen","Jawa Tengah"],["Kab. Lombok Tengah","Nusa Tenggara Barat"],["Kab. Minahasa Tenggara","Sulawesi Utara"],["Kab. Murung Raya","Kalimantan Tengah"],["Kab. Nias","Sumatera Utara"],["Kab. Ogan Komering Ulu","Sumatera Selatan"],["Kab. Seruyan","Kalimantan Tengah"],["Kab. Kudus","Jawa Tengah"],["Kab. Tangerang","Banten"],["Kab. Teluk Wondama","Papua Barat"],["Kota Banjar","Jawa Barat"],["Kota Tangerang Selatan","Banten"],
  ]},
  { klaster: "Integritas Pemilu", topik: "Transparansi dan Akuntabilitas Penyelenggaraan Pemilu: Keterbukaan Informasi, Data Pemilu, dan Kepercayaan Publik", entitas: [
    ["Kab. Bandung","Jawa Barat"],["Kab. Bantaeng","Sulawesi Selatan"],["Kab. Jember","Jawa Timur"],["Kab. Karawang","Jawa Barat"],["Kab. Lombok Barat","Nusa Tenggara Barat"],["Kab. Magelang","Jawa Tengah"],["Kab. Manggarai","Nusa Tenggara Timur"],["Kab. Mempawah","Kalimantan Barat"],["Kab. Purwakarta","Jawa Barat"],["Kab. Rejang Lebong","Bengkulu"],["Kab. Rokan Hulu","Riau"],["Kab. Sidenreng Rappang","Sulawesi Selatan"],["Kab. Sidoarjo","Jawa Timur"],["Kab. Toba Samosir","Sumatera Utara"],["Kab. Wonosobo","Jawa Tengah"],["Kota Tarakan","Kalimantan Utara"],
  ]},
  { klaster: "Integritas Pemilu", topik: "Etika Penyelenggara Pemilu: Nilai Dasar, Independensi dan Profesionalisme", entitas: [
    ["Kab. Aceh Utara","Aceh"],["Kab. Blitar","Jawa Timur"],["Kab. Buleleng","Bali"],["Kab. Gresik","Jawa Timur"],["Kab. Halmahera Barat","Maluku Utara"],["Kab. Kaur","Bengkulu"],["Kab. Ketapang","Kalimantan Barat"],["Kab. Konawe","Sulawesi Tenggara"],["Kab. Minahasa","Sulawesi Utara"],["Kab. Morowali","Sulawesi Tengah"],["Kab. Nias Selatan","Sumatera Utara"],["Kab. Poso","Sulawesi Tengah"],["Kab. Waropen","Papua"],["Kota Ambon","Maluku"],["Kota Bandar Lampung","Lampung"],["Kota Pontianak","Kalimantan Barat"],
  ]},
  { klaster: "Integritas Pemilu", topik: "Integritas Penyelenggara Pemilu: Pembelajaran dari Putusan DKPP", entitas: [
    ["Kab. Aceh Jaya","Aceh"],["Kab. Gunung Mas","Kalimantan Tengah"],["Kab. Kampar","Riau"],["Kab. Brebes","Jawa Tengah"],["Kab. Karimun","Kepulauan Riau"],["Kab. Katingan","Kalimantan Tengah"],["Kab. Lamongan","Jawa Timur"],["Kab. Ogan Komering Ilir","Sumatera Selatan"],["Kab. Pesisir Selatan","Sumatera Barat"],["Kab. Pulau Morotai","Maluku Utara"],["Kab. Sabu Raijua","Nusa Tenggara Timur"],["Kab. Serdang Bedagai","Sumatera Utara"],["Kab. Simalungun","Sumatera Utara"],["Kab. Sukamara","Kalimantan Tengah"],["Kab. Yalimo","Papua Pegunungan"],["Kota Semarang","Jawa Tengah"],
  ]},
  { klaster: "Integritas Pemilu", topik: "Pencegahan dan Manajemen Penanganan Kekerasan Seksual di Lingkungan Bawaslu", entitas: [
    ["Kab. Banyu Asin","Sumatera Selatan"],["Kab. Batang","Jawa Tengah"],["Kab. Batu Bara","Sumatera Utara"],["Kab. Bireuen","Aceh"],["Kab. Bolaang Mongondow Selatan","Sulawesi Utara"],["Kab. Lima Puluh Kota","Sumatera Barat"],["Kab. Maluku Tengah","Maluku"],["Kab. Nias Utara","Sumatera Utara"],["Kab. Pangandaran","Jawa Barat"],["Kab. Pidie Jaya","Aceh"],["Kab. Way Kanan","Lampung"],["Kota Kediri","Jawa Timur"],["Kota Kotamobagu","Sulawesi Utara"],["Kota Langsa","Aceh"],["Kota Sibolga","Sumatera Utara"],["Kota Tual","Maluku"],
  ]},
  { klaster: "Integritas Pemilu", topik: "Tata Kelola Anggaran Pengawasan Pemilu dan Pemilihan di Daerah: DIPA, NPHD, Perencanaan, dan Akuntabilitas", entitas: [
    ["Kab. Bengkalis","Riau"],["Kab. Bulukumba","Sulawesi Selatan"],["Kab. Kaimana","Papua Barat"],["Kab. Kuantan Singingi","Riau"],["Kab. Labuhan Batu","Sumatera Utara"],["Kab. Lahat","Sumatera Selatan"],["Kab. Minahasa Selatan","Sulawesi Utara"],["Kab. Padang Pariaman","Sumatera Barat"],["Kab. Pandeglang","Banten"],["Kab. Sijunjung","Sumatera Barat"],["Kab. Soppeng","Sulawesi Selatan"],["Kab. Sumba Barat","Nusa Tenggara Timur"],["Kab. Sumba Timur","Nusa Tenggara Timur"],["Kab. Wakatobi","Sulawesi Tenggara"],["Kota Jakarta Selatan","DKI Jakarta"],["Kota Tanjung Balai","Sumatera Utara"],
  ]},
  { klaster: "Pemilu Inklusif", topik: "Penyelenggaraan Pemilu di Wilayah dengan Karakteristik Khusus: Kepastian Hukum, Akuntabilitas, dan Perlindungan Hak Pilih", entitas: [
    ["Kab. Aceh Singkil","Aceh"],["Kab. Bantul","DI Yogyakarta"],["Kab. Aceh Barat Daya","Aceh"],["Kab. Intan Jaya","Papua Tengah"],["Kab. Jayawijaya","Papua Pegunungan"],["Kab. Kepulauan Anambas","Kepulauan Riau"],["Kab. Kepulauan Aru","Maluku"],["Kab. Kepulauan Meranti","Riau"],["Kab. Kepulauan Selayar","Sulawesi Selatan"],["Kab. Konawe Kepulauan","Sulawesi Tenggara"],["Kab. Kulon Progo","DI Yogyakarta"],["Kab. Lanny Jaya","Papua Pegunungan"],["Kab. Pangkajene dan Kepulauan","Sulawesi Selatan"],["Kab. Paniai","Papua Tengah"],["Kab. Sleman","DI Yogyakarta"],["Kota Sabang","Aceh"],
  ]},
  { klaster: "Pemilu Inklusif", topik: "Penyelenggaraan Pemilu yang Inklusif bagi Kelompok Rentan: Perencanaan, Afirmasi, dan Perlindungan Hak Pilih", entitas: [
    ["Kab. Alor","Nusa Tenggara Timur"],["Kab. Batang Hari","Jambi"],["Kab. Cilacap","Jawa Tengah"],["Kab. Hulu Sungai Tengah","Kalimantan Selatan"],["Kab. Lampung Selatan","Lampung"],["Kab. Majalengka","Jawa Barat"],["Kab. Penukal Abab Lematang Ilir","Sumatera Selatan"],["Kab. Pidie","Aceh"],["Kab. Pinrang","Sulawesi Selatan"],["Kab. Seluma","Bengkulu"],["Kota Banda Aceh","Aceh"],["Kota Jayapura","Papua"],["Kota Magelang","Jawa Tengah"],["Kota Palangka Raya","Kalimantan Tengah"],["Kota Palembang","Sumatera Selatan"],["Kota Pekalongan","Jawa Tengah"],
  ]},
  { klaster: "Pemilu Inklusif", topik: "Keterwakilan dan Partisipasi Politik Perempuan: Dari Representasi Deskriptif ke Substantif dan Efektivitas Afirmasi", entitas: [
    ["Kab. Balangan","Kalimantan Selatan"],["Kab. Banggai Laut","Sulawesi Tengah"],["Kab. Barito Kuala","Kalimantan Selatan"],["Kab. Barito Timur","Kalimantan Tengah"],["Kab. Jayapura","Papua"],["Kab. Kediri","Jawa Timur"],["Kab. Kutai Timur","Kalimantan Timur"],["Kab. Manokwari","Papua Barat"],["Kab. Merauke","Papua Selatan"],["Kab. Nabire","Papua Tengah"],["Kab. Ngawi","Jawa Timur"],["Kab. Subang","Jawa Barat"],["Kab. Teluk Bintuni","Papua Barat"],["Kota Dumai","Riau"],["Kota Metro","Lampung"],["Kota Sorong","Papua Barat Daya"],
  ]},
  { klaster: "Transformasi Digital Pemilu", topik: "Transformasi Digital Pengawasan Pemilu: Dari Pengawasan Manual Menuju Ekosistem Pengawasan Cerdas Berbasis Data", entitas: [
    ["Kab. Blora","Jawa Tengah"],["Kab. Kolaka Utara","Sulawesi Tenggara"],["Kab. Majene","Sulawesi Barat"],["Kab. Muaro Jambi","Jambi"],["Kab. Muna","Sulawesi Tenggara"],["Kab. Pesisir Barat","Lampung"],["Kab. Pulang Pisau","Kalimantan Tengah"],["Kab. Solok","Sumatera Barat"],["Kab. Tanah Laut","Kalimantan Selatan"],["Kab. Tanjung Jabung Timur","Jambi"],["Kab. Tulungagung","Jawa Timur"],["Kota Balikpapan","Kalimantan Timur"],["Kota Bandung","Jawa Barat"],["Kota Blitar","Jawa Timur"],["Kota Manado","Sulawesi Utara"],["Kota Surabaya","Jawa Timur"],["Kota Subulussalam","Aceh"],
  ]},
  { klaster: "Transformasi Digital Pemilu", topik: "Disinformasi, Misinformasi, dan Manipulasi Ruang Digital: Modus, Kerangka Hukum, dan Deteksi Dini", entitas: [
    ["Kab. Bolaang Mongondow Timur","Sulawesi Utara"],["Kab. Deiyai","Papua Tengah"],["Kab. Fakfak","Papua Barat"],["Kab. Humbang Hasundutan","Sumatera Utara"],["Kab. Karo","Sumatera Utara"],["Kab. Kotawaringin Timur","Kalimantan Tengah"],["Kab. Labuhan Batu Utara","Sumatera Utara"],["Kab. Lampung Utara","Lampung"],["Kab. Manggarai Timur","Nusa Tenggara Timur"],["Kab. Maybrat","Papua Barat Daya"],["Kab. Paser","Kalimantan Timur"],["Kab. Pohuwato","Gorontalo"],["Kab. Seram Bagian Barat","Maluku"],["Kab. Trenggalek","Jawa Timur"],["Kab. Wajo","Sulawesi Selatan"],["Kota Batu","Jawa Timur"],["Kota Jakarta Utara","DKI Jakarta"],
  ]},
  { klaster: "Penegakan Hukum Pemilu", topik: "Penanganan Tindak Pidana Pemilu: Sinergi Sentra Gakkumdu, Efektivitas Penegakan Hukum, dan Rekomendasi Perbaikan Regulasi", entitas: [
    ["Kab. Kapuas","Kalimantan Tengah"],["Kab. Asmat","Papua Selatan"],["Kab. Bone","Sulawesi Selatan"],["Kab. Ende","Nusa Tenggara Timur"],["Kab. Garut","Jawa Barat"],["Kab. Gorontalo Utara","Gorontalo"],["Kab. Gowa","Sulawesi Selatan"],["Kab. Indramayu","Jawa Barat"],["Kab. Kupang","Nusa Tenggara Timur"],["Kab. Lingga","Kepulauan Riau"],["Kab. Luwu Timur","Sulawesi Selatan"],["Kab. Musi Rawas","Sumatera Selatan"],["Kab. Pringsewu","Lampung"],["Kab. Sanggau","Kalimantan Barat"],["Kab. Tanjung Jabung Barat","Jambi"],["Kab. Timor Tengah Selatan","Nusa Tenggara Timur"],
  ]},
  { klaster: "Penegakan Hukum Pemilu", topik: "Penanganan Pelanggaran Administratif Pemilu: Penguatan Kewenangan, Sistem Sanksi, dan Efektivitas Penegakan", entitas: [
    ["Kab. Bangkalan","Jawa Timur"],["Kab. Banyumas","Jawa Tengah"],["Kab. Cianjur","Jawa Barat"],["Kab. Gianyar","Bali"],["Kab. Keerom","Papua"],["Kab. Maluku Tenggara","Maluku"],["Kab. Ngada","Nusa Tenggara Timur"],["Kab. Nganjuk","Jawa Timur"],["Kab. Pegunungan Arfak","Papua Barat"],["Kab. Solok Selatan","Sumatera Barat"],["Kab. Timor Tengah Utara","Nusa Tenggara Timur"],["Kab. Tuban","Jawa Timur"],["Kab. Tulang Bawang Barat","Lampung"],["Kota Banjarmasin","Kalimantan Selatan"],["Kota Medan","Sumatera Utara"],["Kota Pariaman","Sumatera Barat"],
  ]},
  { klaster: "Penegakan Hukum Pemilu", topik: "Penanganan Pelanggaran Administratif Pemilu TSM: Standar Pembuktian, Distribusi Kewenangan, dan Pelaksanaan Putusan", entitas: [
    ["Kab. Belu","Nusa Tenggara Timur"],["Kab. Boyolali","Jawa Tengah"],["Kab. Bulungan","Kalimantan Utara"],["Kab. Bungo","Jambi"],["Kab. Halmahera Utara","Maluku Utara"],["Kab. Karang Asem","Bali"],["Kab. Kuningan","Jawa Barat"],["Kab. Kutai Barat","Kalimantan Timur"],["Kab. Malang","Jawa Timur"],["Kab. Natuna","Kepulauan Riau"],["Kab. Pamekasan","Jawa Timur"],["Kab. Pulau Taliabu","Maluku Utara"],["Kab. Rote Ndao","Nusa Tenggara Timur"],["Kota Batam","Kepulauan Riau"],["Kota Bukittinggi","Sumatera Barat"],["Kota Kupang","Nusa Tenggara Timur"],
  ]},
  { klaster: "Penegakan Hukum Pemilu", topik: "Sengketa Proses: Mediasi, Adjudikasi, dan Koherensi Antarforum", entitas: [
    ["Kab. Aceh Timur","Aceh"],["Kab. Dairi","Sumatera Utara"],["Kab. Dompu","Nusa Tenggara Barat"],["Kab. Gorontalo","Gorontalo"],["Kab. Kepulauan Sangihe","Sulawesi Utara"],["Kab. Kepulauan Talaud","Sulawesi Utara"],["Kab. Mimika","Papua Tengah"],["Kab. Nias Barat","Sumatera Utara"],["Kab. Pasuruan","Jawa Timur"],["Kab. Pelalawan","Riau"],["Kab. Puncak","Papua Tengah"],["Kab. Puncak Jaya","Papua Tengah"],["Kab. Sumbawa","Nusa Tenggara Barat"],["Kab. Tojo Una-Una","Sulawesi Tengah"],["Kota Mojokerto","Jawa Timur"],["Kota Tangerang","Banten"],
  ]},
  { klaster: "Penegakan Hukum Pemilu", topik: "Perselisihan Hasil di Mahkamah Konstitusi: Pola Sengketa, Standar Pembuktian, dan Perkembangan Yurisprudensi", entitas: [
    ["Kab. Banjar","Kalimantan Selatan"],["Kab. Berau","Kalimantan Timur"],["Kab. Bolaang Mongondow Utara","Sulawesi Utara"],["Kab. Buol","Sulawesi Tengah"],["Kab. Buru Selatan","Maluku"],["Kab. Buton Tengah","Sulawesi Tenggara"],["Kab. Jeneponto","Sulawesi Selatan"],["Kota Surakarta","Jawa Tengah"],["Kab. Kayong Utara","Kalimantan Barat"],["Kab. Klaten","Jawa Tengah"],["Kab. Lamandau","Kalimantan Tengah"],["Kab. Mamuju","Sulawesi Barat"],["Kab. Mandailing Natal","Sumatera Utara"],["Kab. Pasaman Barat","Sumatera Barat"],["Kota Gunungsitoli","Sumatera Utara"],["Kota Pagar Alam","Sumatera Selatan"],
  ]},
  { klaster: "Tata Kelola Kelembagaan Bawaslu", topik: "Implementasi Renstra Bawaslu 2025–2029: Penyelarasan Sasaran Strategis, Program, dan Evaluasi Kinerja Organisasi", entitas: [
    ["Kab. Kapuas Hulu","Kalimantan Barat"],["Kab. Kepulauan Yapen","Papua"],["Kab. Kolaka Timur","Sulawesi Tenggara"],["Kab. Jepara","Jawa Tengah"],["Kab. Langkat","Sumatera Utara"],["Kab. Lebong","Bengkulu"],["Kab. Lombok Utara","Nusa Tenggara Barat"],["Kab. Luwu Utara","Sulawesi Selatan"],["Kab. Pati","Jawa Tengah"],["Kab. Penajam Paser Utara","Kalimantan Timur"],["Kab. Seram Bagian Timur","Maluku"],["Kab. Tabanan","Bali"],["Kab. Toli-Toli","Sulawesi Tengah"],["Kab. Tulang Bawang","Lampung"],["Kota Pasuruan","Jawa Timur"],["Kota Pematang Siantar","Sumatera Utara"],
  ]},
  { klaster: "Tata Kelola Kelembagaan Bawaslu", topik: "Manajemen Indikator Kinerja Utama (IKU): Perencanaan, Pengukuran, Evaluasi, dan Pengembangan IKU", entitas: [
    ["Kab. Barru","Sulawesi Selatan"],["Kab. Belitung Timur","Kepulauan Bangka Belitung"],["Kab. Biak Numfor","Papua"],["Kab. Buton Utara","Sulawesi Tenggara"],["Kab. Lembata","Nusa Tenggara Timur"],["Kab. Musi Rawas Utara","Sumatera Selatan"],["Kab. Nagan Raya","Aceh"],["Kab. Padang Lawas Utara","Sumatera Utara"],["Kab. Tebo","Jambi"],["Kota Gorontalo","Gorontalo"],["Kota Jakarta Timur","DKI Jakarta"],["Kota Padang","Sumatera Barat"],["Kota Padang Panjang","Sumatera Barat"],["Kota Prabumulih","Sumatera Selatan"],["Kota Sawah Lunto","Sumatera Barat"],["Kota Solok","Sumatera Barat"],
  ]},
  { klaster: "Tata Kelola Kelembagaan Bawaslu", topik: "Manajemen Pengembangan SDM Bawaslu: Sistem Kompetensi, Kurikulum, dan Kediklatan", entitas: [
    ["Kab. Bengkulu Utara","Bengkulu"],["Kab. Halmahera Tengah","Maluku Utara"],["Kab. Indragiri Hilir","Riau"],["Kab. Kendal","Jawa Tengah"],["Kab. Lampung Timur","Lampung"],["Kab. Malaka","Nusa Tenggara Timur"],["Kab. Mojokerto","Jawa Timur"],["Kab. Sigi","Sulawesi Tengah"],["Kab. Sikka","Nusa Tenggara Timur"],["Kab. Sumedang","Jawa Barat"],["Kab. Tana Toraja","Sulawesi Selatan"],["Kab. Tapanuli Utara","Sumatera Utara"],["Kab. Tegal","Jawa Tengah"],["Kota Kendari","Sulawesi Tenggara"],["Kota Serang","Banten"],["Kota Tasikmalaya","Jawa Barat"],
  ]},
  { klaster: "Tata Kelola Kelembagaan Bawaslu", topik: "Transformasi Kelembagaan Bawaslu: Tata Kelola Organisasi, Manajemen Perubahan, dan Reformasi Birokrasi", entitas: [
    ["Kab. Aceh Barat","Aceh"],["Kab. Bima","Nusa Tenggara Barat"],["Kab. Cirebon","Jawa Barat"],["Kab. Lampung Barat","Lampung"],["Kab. Lampung Tengah","Lampung"],["Kab. Mamuju Utara","Sulawesi Barat"],["Kab. Mukomuko","Bengkulu"],["Kab. Pemalang","Jawa Tengah"],["Kab. Polewali Mandar","Sulawesi Barat"],["Kab. Sampang","Jawa Timur"],["Kab. Sintang","Kalimantan Barat"],["Kab. Situbondo","Jawa Timur"],["Kab. Sumenep","Jawa Timur"],["Kota Jakarta Pusat","DKI Jakarta"],["Kota Pangkal Pinang","Kepulauan Bangka Belitung"],["Kota Probolinggo","Jawa Timur"],
  ]},
  { klaster: "Tata Kelola Kelembagaan Bawaslu", topik: "Manajemen Pengetahuan Bawaslu: Dokumentasi, Berbagi Pengetahuan, Inovasi, dan Keberlanjutan Pengetahuan Kelembagaan", entitas: [
    ["Kab. Asahan","Sumatera Utara"],["Kab. Bangli","Bali"],["Kab. Banjarnegara","Jawa Tengah"],["Kab. Bintan","Kepulauan Riau"],["Kab. Bojonegoro","Jawa Timur"],["Kab. Bombana","Sulawesi Tenggara"],["Kab. Buton Selatan","Sulawesi Tenggara"],["Kab. Halmahera Timur","Maluku Utara"],["Kab. Jembrana","Bali"],["Kab. Jombang","Jawa Timur"],["Kab. Maluku Tenggara Barat","Maluku"],["Kab. Siau Tagulandang Biaro","Sulawesi Utara"],["Kab. Tabalong","Kalimantan Selatan"],["Kota Padangsidimpuan","Sumatera Utara"],["Kota Pekanbaru","Riau"],["Kota Tanjung Pinang","Kepulauan Riau"],
  ]},
];

function toTitleCase(str) {
  return str.toLowerCase().split(" ").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

// "Kab. Bone Bolango" -> "Bawaslu Kabupaten Bone Bolango"
// "Kota Denpasar"     -> "Bawaslu Kota Denpasar"
function toEntityName(raw) {
  if (raw.startsWith("Kab. ")) return `Bawaslu Kabupaten ${raw.slice(5)}`;
  if (raw.startsWith("Kota ")) return `Bawaslu Kota ${raw.slice(5)}`;
  return `Bawaslu ${raw}`;
}

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS topik (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jenis TEXT NOT NULL CHECK (jenis IN ('provinsi', 'kabkota')),
      klaster TEXT NOT NULL,
      nama_topik TEXT NOT NULL
    )
  `);
  try {
    await db.execute(`ALTER TABLE bawaslu_entities ADD COLUMN topik_id INTEGER REFERENCES topik(id)`);
    console.log("Migrasi: kolom topik_id ditambahkan.");
  } catch (e) {
    // kolom sudah ada
  }

  // Reset supaya script ini aman dijalankan berkali-kali (idempotent) —
  // tanpa ini, tiap re-run akan menumpuk topik duplikat dan menyisakan
  // topik_id basi dari run sebelumnya di entitas yang tidak ter-update.
  await db.execute(`UPDATE bawaslu_entities SET topik_id = NULL`);
  await db.execute(`DELETE FROM topik`);
  console.log("Reset: data topik lama dibersihkan sebelum diisi ulang.");

  let tidakKetemu = [];

  // --- Provinsi ---
  for (const row of TOPIK_PROVINSI) {
    const topikResult = await db.execute({
      sql: `INSERT INTO topik (jenis, klaster, nama_topik) VALUES (?, ?, ?)`,
      args: ["provinsi", row.klaster, row.topik],
    });
    const topikId = Number(topikResult.lastInsertRowid);

    for (const namaProvinsi of row.provinsi) {
      const namaEntitas = `Bawaslu Provinsi ${namaProvinsi}`;
      const res = await db.execute({
        sql: `UPDATE bawaslu_entities SET topik_id = ? WHERE nama = ? COLLATE NOCASE`,
        args: [topikId, namaEntitas],
      });
      if (res.rowsAffected === 0) tidakKetemu.push(namaEntitas);
    }
  }
  console.log(`Topik Provinsi: ${TOPIK_PROVINSI.length} topik dimasukkan.`);

  // --- Kab/Kota ---
  for (const row of TOPIK_KABKOTA) {
    const topikResult = await db.execute({
      sql: `INSERT INTO topik (jenis, klaster, nama_topik) VALUES (?, ?, ?)`,
      args: ["kabkota", row.klaster, row.topik],
    });
    const topikId = Number(topikResult.lastInsertRowid);

    for (const [rawNama, namaProvinsiEntitas] of row.entitas) {
      const namaEntitas = toEntityName(rawNama);
      const res = await db.execute({
        sql: `UPDATE bawaslu_entities SET topik_id = ? WHERE nama = ? COLLATE NOCASE`,
        args: [topikId, namaEntitas],
      });
      if (res.rowsAffected === 0) {
        // Entitas ini tidak ada di data hasil seed.mjs (celah di sumber data
        // wilayah) — buat baru langsung dengan topik_id terpasang.
        try {
          await db.execute({
            sql: `INSERT INTO bawaslu_entities (tipe, nama, provinsi_nama, topik_id) VALUES (?, ?, ?, ?)`,
            args: ["kabkota", namaEntitas, namaProvinsiEntitas, topikId],
          });
          console.log(`  (dibuat baru, tidak ada di data wilayah): ${namaEntitas}`);
        } catch (e) {
          tidakKetemu.push(namaEntitas);
        }
      }
    }
  }
  console.log(`Topik Kab/Kota: ${TOPIK_KABKOTA.length} topik dimasukkan.`);

  if (tidakKetemu.length > 0) {
    console.log(`\nPERINGATAN: ${tidakKetemu.length} nama tidak ditemukan di bawaslu_entities (cek ejaan/pastikan sudah jalankan seed.mjs dulu):`);
    tidakKetemu.forEach((n) => console.log(`  - ${n}`));
  } else {
    console.log("\nSemua entitas berhasil dipasangkan dengan topiknya.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
