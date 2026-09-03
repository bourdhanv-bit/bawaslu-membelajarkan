"use client";

import { useEffect, useState, useCallback } from "react";

const SORT_OPTIONS = [
  { value: "skor", label: "Skor gabungan (default)" },
  { value: "views", label: "Views terbanyak" },
  { value: "comments", label: "Comment terbanyak" },
  { value: "likes", label: "Like terbanyak" },
];

const TABS = [
  { key: "provinsi", label: "Per Provinsi Keseluruhan" },
  { key: "kabkota", label: "Per Kab/Kota Keseluruhan" },
  { key: "topik-provinsi", label: "Per Topik Provinsi" },
  { key: "provinsi-kabkota", label: "Per Kab/Kota Tiap Provinsi" },
  { key: "topik-kabkota", label: "Per Topik Kab/Kota" },
];

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") || "";
}
function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export default function Dashboard() {
  const [tab, setTab] = useState("provinsi");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch("/api/admin/check", { headers: authHeaders() }).then((r) => r.json()).then((d) => setIsAdmin(d.isAdmin));
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
  };

  return (
    <>
      <div className="header-band">
        <div className="inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Bawaslu Membelajarkan — Vol 2</h1>
            <p>Ranking video pembelajaran dari Bawaslu Provinsi &amp; Kabupaten/Kota se-Indonesia</p>
          </div>
          {isAdmin ? (
            <button className="btn secondary" onClick={logout} style={{ background: "transparent", color: "#fff", borderColor: "#fff" }}>
              Keluar admin
            </button>
          ) : (
            <button className="link-btn" style={{ color: "#b9c4d1" }} onClick={() => setShowLoginModal(true)}>
              Login admin
            </button>
          )}
        </div>
      </div>

      <div className="app-shell">
        <div className="tabs" style={{ flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "provinsi" && <FlatRankingView tipe="provinsi" isAdmin={isAdmin} showAddButton />}
        {tab === "kabkota" && <FlatRankingView tipe="kabkota" isAdmin={isAdmin} showAddButton />}
        {tab === "topik-provinsi" && <TopikAccordionView jenis="provinsi" isAdmin={isAdmin} />}
        {tab === "provinsi-kabkota" && <ProvinsiAccordionView isAdmin={isAdmin} />}
        {tab === "topik-kabkota" && <TopikAccordionView jenis="kabkota" isAdmin={isAdmin} />}
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onLoggedIn={() => { setShowLoginModal(false); setIsAdmin(true); }} />
      )}
    </>
  );
}

// ============================================================
// Tab 1 & 2: ranking flat (Provinsi / Kab-Kota keseluruhan)
// ============================================================
function FlatRankingView({ tipe, isAdmin, showAddButton }) {
  const [sort, setSort] = useState("skor");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/videos?tipe=${tipe}&sort=${sort}`);
    const data = await res.json();
    setVideos(data.videos || []);
    setLoading(false);
  }, [tipe, sort]);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  return (
    <>
      <div className="toolbar">
        <div className="sort-group">
          Urutkan:
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {isAdmin && showAddButton && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn secondary" onClick={() => setShowImportModal(true)}>Import daftar Bawaslu</button>
            <button className="btn" onClick={() => setShowAddModal(true)}>+ Tambah video</button>
          </div>
        )}
      </div>

      <RankingTable tipe={tipe} videos={videos} loading={loading} isAdmin={isAdmin} onChanged={loadVideos} />

      {showAddModal && (
        <AddVideoModal tipe={tipe} onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); loadVideos(); }} />
      )}
      {showImportModal && (
        <ImportEntitiesModal tipe={tipe} onClose={() => setShowImportModal(false)} onSaved={() => setShowImportModal(false)} />
      )}
    </>
  );
}

// ============================================================
// Tab: Per Topik Provinsi / Per Topik Kab-Kota (accordion)
// ============================================================
function TopikAccordionView({ jenis, isAdmin }) {
  const [topikList, setTopikList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    setLoadingList(true);
    fetch(`/api/topik?jenis=${jenis}`).then((r) => r.json()).then((d) => { setTopikList(d.topik || []); setLoadingList(false); });
  }, [jenis]);

  let currentKlaster = null;

  if (loadingList) return <div className="empty-state">Memuat daftar topik…</div>;

  return (
    <div>
      {topikList.map((t) => {
        const klasterHeader = t.klaster !== currentKlaster;
        currentKlaster = t.klaster;
        return (
          <div key={t.id}>
            {klasterHeader && (
              <div style={{ fontSize: 12, fontWeight: 700, color: "#5b6b7d", textTransform: "uppercase", letterSpacing: ".04em", margin: "18px 0 6px" }}>
                {t.klaster}
              </div>
            )}
            <AccordionRow
              title={t.nama_topik}
              countLabel={`${t.jumlah_video} video`}
              isOpen={openId === t.id}
              onToggle={() => setOpenId(openId === t.id ? null : t.id)}
            >
              <TopikVideoTable tipe={jenis} topikId={t.id} isAdmin={isAdmin} />
            </AccordionRow>
          </div>
        );
      })}
    </div>
  );
}

function TopikVideoTable({ tipe, topikId, isAdmin }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/videos?tipe=${tipe}&topik_id=${topikId}&sort=skor`);
    const data = await res.json();
    setVideos(data.videos || []);
    setLoading(false);
  }, [tipe, topikId]);

  useEffect(() => { load(); }, [load]);

  return <RankingTable tipe={tipe} videos={videos} loading={loading} isAdmin={isAdmin} onChanged={load} compact />;
}

// ============================================================
// Tab: Per Kab/Kota Tiap Provinsi (accordion per provinsi)
// ============================================================
function ProvinsiAccordionView({ isAdmin }) {
  const [provinsiList, setProvinsiList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [openName, setOpenName] = useState(null);

  useEffect(() => {
    setLoadingList(true);
    fetch("/api/provinsi-list").then((r) => r.json()).then((d) => { setProvinsiList(d.provinsi || []); setLoadingList(false); });
  }, []);

  if (loadingList) return <div className="empty-state">Memuat daftar provinsi…</div>;

  return (
    <div>
      {provinsiList.map((p) => (
        <AccordionRow key={p} title={p} isOpen={openName === p} onToggle={() => setOpenName(openName === p ? null : p)}>
          <ProvinsiVideoTable provinsi={p} isAdmin={isAdmin} />
        </AccordionRow>
      ))}
    </div>
  );
}

function ProvinsiVideoTable({ provinsi, isAdmin }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/videos?tipe=kabkota&provinsi=${encodeURIComponent(provinsi)}&sort=skor`);
    const data = await res.json();
    setVideos(data.videos || []);
    setLoading(false);
  }, [provinsi]);

  useEffect(() => { load(); }, [load]);

  return <RankingTable tipe="kabkota" videos={videos} loading={loading} isAdmin={isAdmin} onChanged={load} compact />;
}

// ============================================================
// Komponen bersama
// ============================================================
function AccordionRow({ title, countLabel, isOpen, onToggle, children }) {
  return (
    <div style={{ border: "1px solid #dbe1e8", borderRadius: 4, marginBottom: 8, background: "#fff" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 14px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 14,
        }}
      >
        <span>{title}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10, color: "#5b6b7d", fontSize: 12.5 }}>
          {countLabel}
          <span style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
        </span>
      </button>
      {isOpen && <div style={{ borderTop: "1px solid #dbe1e8", padding: 12 }}>{children}</div>}
    </div>
  );
}

function RankingTable({ tipe, videos, loading, isAdmin, onChanged, compact }) {
  if (loading) return <div className="empty-state">Memuat data…</div>;
  if (videos.length === 0) return <div className="empty-state">Belum ada video.</div>;

  return (
    <table className="rank-table">
      <thead>
        <tr>
          <th>No</th>
          <th>{tipe === "provinsi" ? "Bawaslu Provinsi" : "Bawaslu Kab/Kota"}</th>
          <th>Judul</th>
          <th className="num">Views</th>
          <th className="num">Comment</th>
          <th className="num">Like</th>
        </tr>
      </thead>
      <tbody>
        {videos.map((v, idx) => (
          <VideoRow key={v.id} rank={idx + 1} video={v} isAdmin={isAdmin} onChanged={onChanged} />
        ))}
      </tbody>
    </table>
  );
}

function VideoRow({ rank, video, isAdmin, onChanged }) {
  const refresh = async () => {
    const res = await fetch(`/api/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ refresh: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Gagal refresh data. Coba login admin ulang.");
      return;
    }
    onChanged();
  };

  const hapus = async () => {
    if (!confirm("Hapus video ini?")) return;
    const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Gagal menghapus. Coba login admin ulang.");
      return;
    }
    onChanged();
  };

  return (
    <tr>
      <td className="rank-cell">{rank}</td>
      <td>{video.nama_entitas}</td>
      <td className="title-cell">
        <a href={video.youtube_url} target="_blank" rel="noreferrer">{video.judul}</a>
        {isAdmin && (
          <div style={{ marginTop: 4, display: "flex", gap: 10 }}>
            <button className="link-btn" onClick={refresh}>refresh data</button>
            <button className="link-btn" onClick={hapus}>hapus</button>
          </div>
        )}
      </td>
      <td className="num">{video.views.toLocaleString("id-ID")}</td>
      <td className="num">{video.comments.toLocaleString("id-ID")}</td>
      <td className="num">{video.likes.toLocaleString("id-ID")}</td>
    </tr>
  );
}

function LoginModal({ onClose, onLoggedIn }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setErr("");
    setSaving(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr("Password salah"); return; }
    localStorage.setItem("admin_token", data.token);
    onLoggedIn();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Login Admin</h3>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <div className="err-text">{err}</div>
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>Batal</button>
          <button className="btn" onClick={submit} disabled={saving}>{saving ? "Memeriksa…" : "Masuk"}</button>
        </div>
      </div>
    </div>
  );
}

function AddVideoModal({ tipe, onClose, onSaved }) {
  const [provinsiList, setProvinsiList] = useState([]);
  const [provinsiFilter, setProvinsiFilter] = useState("");
  const [search, setSearch] = useState("");
  const [entities, setEntities] = useState([]);
  const [entityId, setEntityId] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tipe === "kabkota") {
      fetch("/api/provinsi-list").then((r) => r.json()).then((d) => setProvinsiList(d.provinsi || []));
    }
  }, [tipe]);

  useEffect(() => {
    const params = new URLSearchParams({ tipe, exclude_uploaded: "true" });
    if (tipe === "kabkota" && provinsiFilter) params.set("provinsi", provinsiFilter);
    if (search) params.set("q", search);

    if (tipe === "kabkota" && !provinsiFilter && !search) { setEntities([]); return; }

    fetch(`/api/entities?${params.toString()}`).then((r) => r.json()).then((d) => setEntities(d.entities || []));
  }, [tipe, provinsiFilter, search]);

  const submit = async () => {
    setErr("");
    if (!entityId || !url) { setErr("Pilih nama Bawaslu dan isi link YouTube"); return; }
    setSaving(true);
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ entity_id: Number(entityId), youtube_url: url }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error || "Gagal menyimpan"); return; }
    onSaved();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Tambah video — {tipe === "provinsi" ? "Bawaslu Provinsi" : "Bawaslu Kab/Kota"}</h3>

        {tipe === "kabkota" && (
          <>
            <label>Filter Provinsi</label>
            <select value={provinsiFilter} onChange={(e) => { setProvinsiFilter(e.target.value); setEntityId(""); }}>
              <option value="">— Semua Provinsi —</option>
              {provinsiList.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label>Cari nama Kab/Kota</label>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setEntityId(""); }} placeholder="ketik nama kabupaten/kota…" />
          </>
        )}

        <label>Nama Bawaslu</label>
        <select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
          <option value="">
            {entities.length === 0
              ? (tipe === "kabkota" && !provinsiFilter && !search
                  ? "— Pilih provinsi atau ketik pencarian dulu —"
                  : "— Semua sudah pernah diupload —")
              : "— Pilih —"}
          </option>
          {entities.map((e) => <option key={e.id} value={e.id}>{e.nama}</option>)}
        </select>

        <label>Link YouTube</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />

        <div className="err-text">{err}</div>

        <div className="actions">
          <button className="btn secondary" onClick={onClose}>Batal</button>
          <button className="btn" onClick={submit} disabled={saving}>{saving ? "Menyimpan…" : "Simpan (auto-fetch views/like/comment)"}</button>
        </div>
      </div>
    </div>
  );
}

function ImportEntitiesModal({ tipe, onClose, onSaved }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const names = text.split("\n").map((s) => s.trim()).filter(Boolean);
    if (names.length === 0) return;
    setSaving(true);
    const res = await fetch("/api/import-entities", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ tipe, names }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) setResult(`Berhasil menambahkan ${data.inserted} dari ${data.total_diminta} nama.`);
    else setResult(data.error || "Gagal import");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Import daftar {tipe === "provinsi" ? "Bawaslu Provinsi" : "Bawaslu Kabupaten/Kota"}</h3>
        <label>Tempel satu nama per baris</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={"Bawaslu Kabupaten Malang\nBawaslu Kota Batu\n..."} />
        <div className="err-text">{result}</div>
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>Tutup</button>
          <button className="btn" onClick={submit} disabled={saving}>{saving ? "Mengimpor…" : "Import"}</button>
        </div>
      </div>
    </div>
  );
}
