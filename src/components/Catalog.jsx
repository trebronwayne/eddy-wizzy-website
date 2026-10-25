import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, Headphones, Play, Search } from 'lucide-react';
import { siteContent as content } from '../data/siteContent';
import { livePerformances, songs } from '../data/catalog';
import { AudioPreview, CountUp } from './Dynamic';
import { useImageSrc } from '../lib/images';
import { coverUrl, sortedVersions, thumb, watchPath, watchUrl } from '../lib/tracks';

function Cover({ id, ...rest }) {
  return <img src={coverUrl(id)} alt="" onError={(event) => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = thumb(id); } }} {...rest} />;
}
const previewSrc = (songId) => `${import.meta.env.BASE_URL}audio/${songId}-preview.mp3`;
const previewIds = new Set(content.previewIds);
const LABEL = { video: 'Watch', track: 'Play', audio: 'Listen', lyrics: 'Lyrics' };
const ICON = { video: Play, track: Play, audio: Headphones, lyrics: FileText };


/* ---------- Stats strip (counted from the song list; no YouTube figures) ---------- */
export function StatsStrip() {
  const stats = [
    { value: Math.floor(songs.length / 5) * 5, suffix: '+', label: 'Songs released' },
    { value: collaborators.length, suffix: '', label: 'Collaborating artists' },
    { value: livePerformances.length, suffix: '', label: 'Live performances to watch' },
  ];
  return (
    <section className="stats wrap" aria-label="Eddy Wizzy in numbers">
      <div className="stats-grid stats-grid--3">
        {stats.map((stat) => <div className="stat" key={stat.label}><b><CountUp value={stat.value} suffix={stat.suffix} /></b><small>{stat.label}</small></div>)}
      </div>
    </section>
  );
}

/* ---------- Latest release (big feature + two more new songs) ---------- */
export function LatestRelease() {
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
        <Link className="latest-art" to={watchPath(main.youtubeId)} aria-label={`Watch ${main.title}`}>
          <img src={cover || coverUrl(main.youtubeId)} alt={`${main.title} cover art`} decoding="async" onError={(event) => { const img = event.currentTarget; if (cover) onCoverError(); else if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = thumb(main.youtubeId); } }} />
          <span className="latest-art-play"><Play size={26} fill="currentColor" /></span>
        </Link>
        <div className="latest-copy">
          <p className="eyebrow"><span className="status-dot" /> NEW · OUT NOW</p>
          <h3>{main.title}</h3>
          <p className="latest-credit">Eddy Wizzy{main.credit ? ` · ${main.credit}` : ''}</p>
          <AudioPreview src={previewSrc(main.id)} title={main.title} />
          <div className="latest-actions">
            <Link className="button button--accent" to={watchPath(main.youtubeId)}><Play size={16} fill="currentColor" /> Watch video</Link>
            {apple && <a className="button button--soft" href={apple.href} target="_blank" rel="noreferrer">Listen on Apple Music <ArrowUpRight size={16} /></a>}
            <a className="button button--soft" href={main.href} target="_blank" rel="noreferrer">YouTube <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </div>
      <div className="latest-more">
        {more.map((release) => (
          <article className="latest-mini" key={release.id}>
            <Link className="latest-mini-thumb" to={watchPath(release.youtubeId)} aria-label={`Play ${release.title}`}>
              <Cover id={release.youtubeId} loading="lazy" decoding="async" />
              <span className="song-play"><Play size={18} fill="currentColor" /></span>
            </Link>
            <div>
              <p className="eyebrow">NEW · {release.released}</p>
              <h3>{release.title}</h3>
              <AudioPreview src={previewSrc(release.id)} title={release.title} compact />
              <div className="song-actions">
                <Link className="pill-btn" to={watchPath(release.youtubeId)}><Play size={14} /> Play</Link>
                <a className="pill-btn pill-btn--icon" href={release.href} target="_blank" rel="noreferrer" aria-label={`Open ${release.title} on YouTube`}><ArrowUpRight size={14} /></a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Song card + full catalogue with search, filter and sort ---------- */
function SongCard({ song }) {
  const versions = sortedVersions(song);
  const main = versions[0];
  return (
    <article className="song-card">
      <Link className="song-thumb" to={watchPath(main.id)} aria-label={`Play ${song.title}`}>
        <Cover id={main.id} loading="lazy" decoding="async" />
        <span className="song-play"><Play size={20} fill="currentColor" /></span>
        {song.released && <span className="song-badge">NEW</span>}
        {main.length && <span className="song-len">{main.length}</span>}
      </Link>
      <div className="song-body">
        <h3>{song.title}</h3>
        {song.feat && <p className="song-feat">ft. {song.feat}</p>}
        <p className="song-meta">{song.released ? song.label : versions.map((v) => v.label).join(' · ')}</p>
        {previewIds.has(song.id) && <AudioPreview src={previewSrc(song.id)} title={song.title} compact />}
        <div className="song-actions">
          {versions.map((version) => {
            const Icon = ICON[version.type];
            return <Link className="pill-btn" key={version.id} to={watchPath(version.id)}><Icon size={14} /> {LABEL[version.type]}</Link>;
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
            <option value="new">Newest first</option><option value="views">Fan favourites</option><option value="az">A to Z</option>
          </select></label>
      </div>
      <p className="catalog-count" role="status">Showing {shown.length} of {list.length} songs{list.length !== songs.length ? ` (${songs.length} in total)` : ''}</p>
      {list.length === 0
        ? <div className="shows-empty"><div><h3>No songs match that search.</h3><p>Try a different spelling, or clear the filters.</p></div></div>
        : <div className="song-grid">{shown.map((song) => <SongCard key={song.id} song={song} />)}</div>}
      {!query && shown.length < list.length && <div className="catalog-more"><button type="button" className="button button--soft" onClick={() => setLimit((value) => value + PAGE)}>Show more songs</button></div>}
    </div>
  );
}

/* ---------- Videos page pieces ---------- */
function VideoThumb({ id, title, meta, length }) {
  return (
    <Link className="vthumb" to={watchPath(id)} aria-label={`Play ${title}`}>
      <span className="vthumb-img"><Cover id={id} loading="lazy" decoding="async" /><span className="song-play"><Play size={20} fill="currentColor" /></span>{length && <span className="song-len">{length}</span>}</span>
      <span className="vthumb-title">{title}</span>
      {meta && <span className="vthumb-meta">{meta}</span>}
    </Link>
  );
}

export function MostWatched() {
  const top = useMemo(() => [...songs].filter((s) => s.versions.some((v) => v.type === 'video' || v.type === 'track')).sort((a, b) => b.views - a.views).slice(0, 6), []);
  return (
    <div className="video-grid">
      {top.map((song) => {
        const version = sortedVersions(song)[0];
        return <VideoThumb key={song.id} id={version.id} title={song.title} length={version.length} meta={song.feat ? `ft. ${song.feat}` : version.label} />;
      })}
    </div>
  );
}

export function LivePerformances() {
  return (
    <div className="video-grid">
      {livePerformances.map((item) => <VideoThumb key={item.id} id={item.id} title={item.title} length={item.length} meta={item.kind} />)}
    </div>
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
