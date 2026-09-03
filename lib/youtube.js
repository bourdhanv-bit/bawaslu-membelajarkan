export function extractYoutubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function fetchYoutubeStats(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  const item = data.items?.[0];
  if (!item) return null;

  return {
    judul: item.snippet?.title || "(judul tidak ditemukan)",
    views: parseInt(item.statistics?.viewCount || "0", 10),
    likes: parseInt(item.statistics?.likeCount || "0", 10),
    comments: parseInt(item.statistics?.commentCount || "0", 10),
  };
}
