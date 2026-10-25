import { livePerformances, songs } from '../data/catalog';

// Covers are saved on this site (public/covers/<youtube-id>.webp). If one is missing, YouTube's own thumbnail is used.
export const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const coverUrl = (id) => `${import.meta.env.BASE_URL}covers/${id}.webp`;
export const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
export const watchPath = (id) => `/watch?v=${id}`;

const ORDER = ['video', 'track', 'audio', 'lyrics'];
export const VERSION_LABEL = { video: 'Video', track: 'Track', audio: 'Audio', lyrics: 'Lyrics' };
export const sortedVersions = (song) => [...song.versions].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));

// One entry per song (its best version first) followed by the live performances.
export const tracks = [
  ...songs.map((song) => {
    const versions = sortedVersions(song);
    return {
      key: song.id,
      kind: 'song',
      title: song.title,
      subtitle: song.feat ? `ft. ${song.feat}` : 'Eddy Wizzy',
      isNew: Boolean(song.released),
      versions: versions.map((v) => ({ id: v.id, type: v.type, label: VERSION_LABEL[v.type] || v.label, detail: v.label, length: v.length })),
      views: song.views,
    };
  }),
  ...livePerformances.map((item) => ({
    key: `live-${item.id}`,
    kind: 'live',
    title: item.title,
    subtitle: item.kind,
    isNew: false,
    versions: [{ id: item.id, type: 'video', label: 'Video', detail: item.kind, length: item.length }],
    views: item.views,
  })),
];

export function findTrack(videoId) {
  const index = tracks.findIndex((track) => track.versions.some((v) => v.id === videoId));
  if (index === -1) return null;
  const track = tracks[index];
  return { index, track, version: track.versions.find((v) => v.id === videoId) };
}

// Plain-language line for the details panel, e.g. "Official video · 3:04".
export const versionLine = (version) => [version.detail, version.length].filter(Boolean).join(' · ');
