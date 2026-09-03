"use client";

import { useEffect, useState, useCallback } from "react";

const SORT_OPTIONS = [
  { value: "skor", label: "Skor gabungan (default)" },
  { value: "views", label: "Views terbanyak" },
  { value: "comments", label: "Comment terbanyak" },
  { value: "likes", label: "Like terbanyak" },
  { value: "shares", label: "Shares terbanyak" },
];

export default function Dashboard() {
  const [tipe, setTipe] = useState("provinsi");
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

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  return (
    <>
      <div className="header-band">
        <div className="inner">
          <h1>Bawaslu Membelajarkan — Vol 2</h1>
          <p>Ranking video pembelajaran dari Bawaslu Provinsi &amp; Kabupaten/Kota se-Indonesia</p>
        </div>
      </div>

      <div className="app-shell">
        <div className="tabs">
          <button className={tipe === "provinsi" ? "active" : ""} onClick={() => setTipe("provinsi")}>
            Bawaslu Provinsi
          </button>
          <button className={tipe === "kabkota" ? "active" : ""} onClick={() => setTipe("kabkota")}>
            Bawaslu Kabupaten/Kota
          </button>
        </div>

        <div className="toolbar">
          <div className="sort-group">
            Urutkan:
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn secondary" onClick={() => setShowImportModal(true)}>
              Import daftar Bawaslu
            </button>
            <button className="btn" onClick={() => setShowAddModal(true)}>
              + Tambah video
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data…</div>
        ) : videos.length === 0 ? (
          <div className="empty-state">Belum ada video untuk kategori ini. Klik &quot;+ Tambah video&quot; untuk mulai.</div>
        ) : (
          <table className="rank-table">
            <thead>
              <tr>
                <th>No</th>
                <th>{tipe === "provinsi" ? "Bawaslu Provinsi" : "Bawaslu Kab/Kota"}</th>
                <th>Judul</th>
                <th className="num">Views</th>
                <th className="num">Comment</th>
                <th className="num">Like</th>
                <th className="num">Shares</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v, idx) => (
                <VideoRow key={v.id} rank={idx + 1} video={v} onChanged={loadVideos} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <AddVideoModal
          tipe={tipe}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); loadVideos(); }}
        />
      )}

      {showImportModal && (
        <ImportEntitiesModal
          tipe={tipe}
          onClose={() => setShowImportModal(false)}
          onSaved={() => setShowImportModal(false)}
        />
      )}
    </>
  );
}

function VideoRow({ rank, video, onChanged }) {
  const [shares, setShares] = useState(video.shares);
  const [saving, setSaving] = useState(false);

  const saveShares = async () => {
    setSaving(true);
    await fetch(`/api/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shares: Number(shares) || 0 }),
    });
    setSaving(false);
    onChanged();
  };

  const refresh = async () => {
    await fetch(`/api/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: true }),
    });
    onChanged();
  };

  const hapus = async () => {
    if (!confirm("Hapus video ini?")) return;
    await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <tr>
      <td className="rank-cell">{rank}</td>
      <td>{video.nama_entitas}</td>
      <td className="title-cell">
        <a href={video.youtube_url} target="_blank" rel="noreferrer">{video.judul}</a>
        <div style={{ marginTop: 4, display: "flex", gap: 10 }}>
          <button className="link-btn" onClick={refresh}>refresh data</button>
          <button className="link-btn" onClick={hapus}>hapus</button>
        </div>
      </td>
      <td className="num">{video.views.toLocaleString("id-ID")}</td>
      <td className="num">{video.comments.toLocaleString("id-ID")}</td>
      <td className="num">{video.likes.toLocaleString("id-ID")}</td>
      <td className="num">
        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          onBlur={saveShares}
          style={{ width: 70, padding: "4px 6px", textAlign: "right", border: "1px solid #dbe1e8", borderRadius: 3 }}
          disabled={saving}
        />
      </td>
    </tr>
  );
}

function AddVideoModal({ tipe, onClose, onSaved }) {
  const [entities, setEntities] = useState([]);
  const [entityId, setEntityId] = useState("");
  const [url, setUrl] = useState("");
  const [shares, setShares] = useState(0);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/entities?tipe=${tipe}`).then((r) => r.json()).then((d) => setEntities(d.entities || []));
  }, [tipe]);

  const submit = async () => {
    setErr("");
    if (!entityId || !url) { setErr("Pilih nama Bawaslu dan isi link YouTube"); return; }
    setSaving(true);
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity_id: Number(entityId), youtube_url: url, shares: Number(shares) || 0 }),
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

        <label>Nama Bawaslu</label>
        <select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
          <option value="">— Pilih —</option>
          {entities.map((e) => <option key={e.id} value={e.id}>{e.nama}</option>)}
        </select>

        <label>Link YouTube</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />

        <label>Jumlah shares (manual)</label>
        <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} />

        <div className="err-text">{err}</div>

        <div className="actions">
          <button className="btn secondary" onClick={onClose}>Batal</button>
          <button className="btn" onClick={submit} disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan (auto-fetch views/like/comment)"}
          </button>
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipe, names }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setResult(`Berhasil menambahkan ${data.inserted} dari ${data.total_diminta} nama.`);
    } else {
      setResult(data.error || "Gagal import");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Import daftar {tipe === "provinsi" ? "Bawaslu Provinsi" : "Bawaslu Kabupaten/Kota"}</h3>
        <label>Tempel satu nama per baris</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Bawaslu Kabupaten Malang\nBawaslu Kota Batu\nBawaslu Kabupaten Blitar\n..."}
        />
        <div className="err-text">{result}</div>
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>Tutup</button>
          <button className="btn" onClick={submit} disabled={saving}>
            {saving ? "Mengimpor…" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
