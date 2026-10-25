import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, Headphones, Play, Search } from 'lucide-react';
import { siteContent as content } from '../data/siteContent';
import { catalogMeta, livePerformances, songs } from '../data/catalog';
import { AudioPreview, CountUp, PlayerModal } from './Dynamic';
import { useImageSrc } from '../lib/images';

// Covers are saved on this site (public/covers/<youtube-id>.webp). If one is missing, YouTube's own thumbnail is used.
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const coverUrl = (id) => `${import.meta.env.BASE_URL}covers/${id}.webp`;
function Cover({ id, ...rest }) {
  return <img src={coverUrl(id)} alt="" onError={(event) => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = thumb(id); } }} {...rest} />;
}
const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
const previewSrc = (songId) => `${import.meta.env.BASE_URL}audio/${songId}-preview.mp3`;
const previewIds = new Set(content.previewIds);
const ORDER = ['video', 'track', 'audio', 'lyrics'];
const LABEL = { video: 'Watch', track: 'Play', audio: 'Listen', lyrics: 'Lyrics' };
const ICON = { video: Play, track: Play, audio: Headphones, lyrics: FileText };

export function formatViews(count) {
  if (count >= 1e6) return `${(count / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1e4) return `${Math.round(count / 1e3)}K`;
  if (count >= 1e3) return `${(count / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}

const sortedVersions = (song) => [...song.versions].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));

/* ---------- Stats strip (real numbers from the channel) ---------- */
export function StatsStrip() {
  const subscribers = parseFloat(catalogMeta.subscribers);
  const stats = [
    { value: subscribers, decimals: 1, suffix: catalogMeta.subscribers.replace(/[\d.]/g, ''), label: 'YouTube subscribers' },
    { value: Math.floor(catalogMeta.listedViews / 1e6), suffix: 'M+', label: 'YouTube views' },
    { value: Math.floor(songs.length / 5) * 5, suffix: '+', label: 'Songs released' },
    { value: Math.floor(catalogMeta.channelVideos / 10) * 10, suffix: '+', label: 'Videos on the channel' },
  ];
  return (
    <section className="stats wrap" aria-label="Eddy Wizzy in numbers">
      <div className="stats-grid">
        {stats.map((stat) => <div className="stat" key={stat.label}><b><CountUp value={stat.value} decimals={stat.decimals || 0} suffix={stat.suffix} /></b><small>{stat.label}</small></div>)}
      </div>
      <p className="stats-note">YouTube figures as of {catalogMeta.asOf}.</p>
    </section>
  );
}

/* ---------- Latest release (big feature + two more new songs) ---------- */
export function LatestRelease() {
  const [playing, setPlaying] = useState(null);
  const close = useCallback(() => setPlaying(null), []);
  const [main, ...more] = content.releases;
  const [cover, onCoverError] = useImageSrc(main.cover);
  const apple = content.socialLinks.find((link) => link.label === 'Apple Music');
  return (
    <section className="section-block wrap latest" id="latest">
      <div className="section-heading">
        <div><p className="eyebrow">LATEST RELEASE</p><h2>Fresh from the fire.</h2></div>
        <Link className="text-link" to="/music">All songs <ArrowUpRight size={16} /></Link>
      </div>
      <div className="latest-feature">
        <button type="button" className="latest-art" onClick={() => setPlaying({ id: main.youtubeId, title: main.title })} aria-label={`Watch ${main.title}`}>
          <img src={cover || coverUrl(main.youtubeId)} alt={`${main.title} cover art`} decoding="async" onError={(event) => { const img = event.currentTarget; if (cover) onCoverError(); else if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = thumb(main.youtubeId); } }} />
          <span className="latest-art-play"><Play size={26} fill="currentColor" /></span>
        </button>
        <div className="latest-copy">
          <p className="eyebrow"><span className="status-dot" /> NEW · OUT NOW</p>
          <h3>{main.title}</h3>
          <p className="latest-credit">Eddy Wizzy{main.credit ? ` · ${main.credit}` : ''}</p>
          <AudioPreview src={previewSrc(main.id)} title={main.title} />
          <div className="latest-actions">
            <button type="button" className="button button--accent" onClick={() => setPlaying({ id: main.youtubeId, title: main.title })}><Play size={16} fill="currentColor" /> Watch video</button>
            {apple && <a className="button button--soft" href={apple.href} target="_blank" rel="noreferrer">Listen on Apple Music <ArrowUpRight size={16} /></a>}
            <a className="button button--soft" href={main.href} target="_blank" rel="noreferrer">YouTube <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </div>
      <div className="latest-more">
        {more.map((release) => (
          <article className="latest-mini" key={release.id}>
            <button type="button" className="latest-mini-thumb" onClick={() => setPlaying({ id: release.youtubeId, title: release.title })} aria-label={`Play ${release.title}`}>
              <Cover id={release.youtubeId} loading="lazy" decoding="async" />
              <span className="song-play"><Play size={18} fill="currentColor" /></span>
            </button>
            <div>
              <p className="eyebrow">NEW · {release.released}</p>
              <h3>{release.title}</h3>
              <AudioPreview src={previewSrc(release.id)} title={release.title} compact />
              <div className="song-actions">
                <button type="button" className="pill-btn" onClick={() => setPlaying({ id: release.youtubeId, title: release.title })}><Play size={14} /> Play</button>
                <a className="pill-btn pill-btn--icon" href={release.href} target="_blank" rel="noreferrer" aria-label={`Open ${release.title} on YouTube`}><ArrowUpRight size={14} /></a>
              </div>
            </div>
          </article>
        ))}
      </div>
      {playing && <PlayerModal video={playing} onClose={close} />}
    </section>
  );
}

/* ---------- Song card + full catalogue with search, filter and sort ---------- */
function SongCard({ song, onPlay }) {
  const versions = sortedVersions(song);
  const main = versions[0];
  return (
    <article className="song-card">
      <button type="button" className="song-thumb" onClick={() => onPlay({ id: main.id, title: song.title })} aria-label={`Play ${song.title}`}>
        <Cover id={main.id} loading="lazy" decoding="async" />
        <span className="song-play"><Play size={20} fill="currentColor" /></span>
        {song.released && <span className="song-badge">NEW</span>}
        {main.length && <span className="song-len">{main.length}</span>}
      </button>
      <div className="song-body">
        <h3>{song.title}</h3>
        {song.feat && <p className="song-feat">ft. {song.feat}</p>}
        <p className="song-meta">{song.views > 0 ? `${formatViews(song.views)} views` : song.label}</p>
        {previewIds.has(song.id) && <AudioPreview src={previewSrc(song.id)} title={song.title} compact />}
        <div className="song-actions">
          {versions.map((version) => {
            const Icon = ICON[version.type];
            return <button type="button" className="pill-btn" key={version.id} onClick={() => onPlay({ id: version.id, title: `${song.title} (${version.label})` })}><Icon size={14} /> {LABEL[version.type]}</button>;
          })}
          <a className="pill-btn pill-btn--icon" href={watchUrl(main.id)} target="_blank" rel="noreferrer" aria-label={`Open ${song.title} on YouTube`}><ArrowUpRight size={14} /></a>
        </div>
      </div>
    </article>
  );
}

const FILTERS = [['all', 'All'], ['video', 'Videos'], ['audio', 'Audio'], ['lyrics', 'Lyrics']];
const PAGE = 12;

export function Catalog() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('new');
  const [limit, setLimit] = useState(PAGE);
  const [playing, setPlaying] = useState(null);
  const close = useCallback(() => setPlaying(null), []);

  const list = useMemo(() => {
    const text = query.trim().toLowerCase();
    let out = songs.filter((song) => {
      if (text && !`${song.title} ${song.feat}`.toLowerCase().includes(text)) return false;
      if (filter === 'all') return true;
      if (filter === 'video') return song.versions.some((v) => v.type === 'video' || v.type === 'track');
      return song.versions.some((v) => v.type === filter);
    });
    if (sort === 'views') out = [...out].sort((a, b) => b.views - a.views);
    if (sort === 'az') out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }, [query, filter, sort]);

  const shown = query ? list : list.slice(0, limit);
  const reset = () => setLimit(PAGE);

  return (
    <div className="catalog">
      <div className="catalog-controls">
        <label className="catalog-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search songs</span>
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); reset(); }} placeholder="Search songs or collaborators" /></label>
        <div className="chips" role="group" aria-label="Filter songs">
          {FILTERS.map(([key, label]) => <button key={key} type="button" className={`chip ${filter === key ? 'chip--on' : ''}`} aria-pressed={filter === key} onClick={() => { setFilter(key); reset(); }}>{label}</button>)}
        </div>
        <label className="catalog-sort"><span>Sort</span>
          <select value={sort} onChange={(event) => { setSort(event.target.value); reset(); }}>
            <option value="new">Newest first</option><option value="views">Most viewed</option><option value="az">A to Z</option>
          </select></label>
      </div>
      <p className="catalog-count" role="status">Showing {shown.length} of {list.length} songs{list.length !== songs.length ? ` (${songs.length} in total)` : ''}</p>
      {list.length === 0
        ? <div className="shows-empty"><div><h3>No songs match that search.</h3><p>Try a different spelling, or clear the filters.</p></div></div>
        : <div className="song-grid">{shown.map((song) => <SongCard key={song.id} song={song} onPlay={setPlaying} />)}</div>}
      {!query && shown.length < list.length && <div className="catalog-more"><button type="button" className="button button--soft" onClick={() => setLimit((value) => value + PAGE)}>Show more songs</button></div>}
      {playing && <PlayerModal video={playing} onClose={close} />}
    </div>
  );
}

/* ---------- Videos page pieces ---------- */
function VideoThumb({ id, title, meta, length, onPlay }) {
  return (
    <button type="button" className="vthumb" onClick={() => onPlay({ id, title })} aria-label={`Play ${title}`}>
      <span className="vthumb-img"><Cover id={id} loading="lazy" decoding="async" /><span className="song-play"><Play size={20} fill="currentColor" /></span>{length && <span className="song-len">{length}</span>}</span>
      <span className="vthumb-title">{title}</span>
      {meta && <span className="vthumb-meta">{meta}</span>}
    </button>
  );
}

export function MostWatched() {
  const [playing, setPlaying] = useState(null);
  const close = useCallback(() => setPlaying(null), []);
  const top = useMemo(() => [...songs].filter((s) => s.versions.some((v) => v.type === 'video' || v.type === 'track')).sort((a, b) => b.views - a.views).slice(0, 6), []);
  return (
    <>
      <div className="video-grid">
        {top.map((song) => {
          const version = sortedVersions(song)[0];
          return <VideoThumb key={song.id} id={version.id} title={song.title} length={version.length} meta={`${formatViews(song.views)} views`} onPlay={setPlaying} />;
        })}
      </div>
      {playing && <PlayerModal video={playing} onClose={close} />}
    </>
  );
}

export function LivePerformances() {
  const [playing, setPlaying] = useState(null);
  const close = useCallback(() => setPlaying(null), []);
  return (
    <>
      <div className="video-grid">
        {livePerformances.map((item) => <VideoThumb key={item.id} id={item.id} title={item.title} length={item.length} meta={`${item.kind} · ${formatViews(item.views)} views`} onPlay={setPlaying} />)}
      </div>
      {playing && <PlayerModal video={playing} onClose={close} />}
    </>
  );
}

/* ---------- Collaborators, taken from the song list ---------- */
const tidy = (name) => (name === 'Trip Otrip' ? 'Trip' : name);
export const collaborators = [...new Set(songs.flatMap((song) => (song.feat ? song.feat.split(/ & /).map((n) => tidy(n.trim())) : [])))];

export function Collaborations() {
  return (
    <div className="collabs">
      <p className="eyebrow">COLLABORATIONS · {collaborators.length} ARTISTS</p>
      <ul>{collaborators.map((name) => <li key={name}>{name}</li>)}</ul>
    </div>
  );
}
