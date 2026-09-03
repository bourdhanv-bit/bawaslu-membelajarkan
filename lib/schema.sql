CREATE TABLE IF NOT EXISTS bawaslu_entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipe TEXT NOT NULL CHECK (tipe IN ('provinsi', 'kabkota')),
  nama TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL REFERENCES bawaslu_entities(id),
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  judul TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_videos_entity ON videos(entity_id);
