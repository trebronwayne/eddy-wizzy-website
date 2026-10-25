import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Play, Search } from 'lucide-react';
import { siteContent as content } from '../data/siteContent';
import { livePerformances, songs } from '../data/catalog';
import { useImageSrc } from '../lib/images';
import { coverUrl, isNewRelease, releaseLabel, sortedVersions, thumb, watchPath } from '../lib/tracks';

// Covers are saved on this site (public/covers/<youtube-id>.webp). If one is missing, YouTube's own thumbnail is used.
function Cover({ id, ...rest }) {
  return <img src={coverUrl(id)} alt="" onError={(event) => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = thumb(id); } }} {...rest} />;
}

/* ---------- Latest release (one big feature + two more new songs) ---------- */
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
          <p className="eyebrow">{isNewRelease(main.date) && <><span className="status-dot" /> NEW · </>}{releaseLabel(main).toUpperCase()}</p>
          <h3>{main.title}</h3>
          <p className="latest-credit">Eddy Wizzy{main.credit ? ` · ${main.credit}` : ''}</p>
          <div className="latest-actions">
            <Link className="button button--accent" to={watchPath(main.youtubeId)}><Play size={16} fill="currentColor" /> Watch video</Link>
            {apple && <a className="button button--soft" href={apple.href} target="_blank" rel="noreferrer">Apple Music <ArrowUpRight size={16} /></a>}
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
              <p className="eyebrow">{isNewRelease(release.date) ? 'NEW · ' : ''}{releaseLabel(release).toUpperCase()}</p>
              <h3>{release.title}</h3>
              <div className="song-actions">
                <Link className="pill-btn" to={watchPath(release.youtubeId)}><Play size={14} /> Play</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Song card: cover, title, one line of detail. One tap target. ---------- */
function SongCard({ song }) {
  const main = sortedVersions(song)[0];
  return (
    <Link className="song-card" to={watchPath(main.id)} aria-label={`Play ${song.title}`}>
      <div className="song-thumb">
        <Cover id={main.id} loading="lazy" decoding="async" />
        <span className="song-play"><Play size={20} fill="currentColor" /></span>
        {isNewRelease(song.date) && <span className="song-badge">NEW</span>}
        {main.length && <span className="song-len">{main.length}</span>}
      </div>
      <div className="song-body">
        <h3>{song.title}</h3>
        <p className="song-meta">{releaseLabel(song)}</p>
      </div>
    </Link>
  );
}

const PAGE = 12;

/* ---------- Full catalogue: search + sort only ---------- */
export function Catalog() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const text = query.trim().toLowerCase();
    let out = songs.filter((song) => !text || song.title.toLowerCase().includes(text));
    if (sort === 'views') out = [...out].sort((a, b) => b.views - a.views);
    if (sort === 'az') out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'new') out = [...out].sort((a, b) => b.date.localeCompare(a.date));
    return out;
  }, [query, sort]);

  const shown = query ? list : list.slice(0, limit);

  return (
    <div className="catalog">
      <div className="catalog-controls">
        <label className="catalog-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search songs</span>
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE); }} placeholder="Search songs" /></label>
        <label className="catalog-sort"><span>Sort</span>
          <select value={sort} onChange={(event) => { setSort(event.target.value); setLimit(PAGE); }}>
            <option value="new">Newest first</option><option value="views">Fan favourites</option><option value="az">A to Z</option>
          </select></label>
      </div>
      <p className="catalog-count" role="status">{query ? `${list.length} ${list.length === 1 ? 'song' : 'songs'} found` : `${songs.length} songs`}</p>
      {list.length === 0
        ? <div className="shows-empty"><div><h3>No songs match that search.</h3><p>Try a different spelling.</p></div></div>
        : <div className="song-grid">{shown.map((song) => <SongCard key={song.id} song={song} />)}</div>}
      {!query && shown.length < list.length && <div className="catalog-more"><button type="button" className="button button--soft" onClick={() => setLimit((value) => value + PAGE)}>Show more songs</button></div>}
    </div>
  );
}

/* ---------- Video grids (Home and Videos pages) ---------- */
function VideoThumb({ id, title, meta, length }) {
  return (
    <Link className="vthumb" to={watchPath(id)} aria-label={`Play ${title}`}>
      <span className="vthumb-img"><Cover id={id} loading="lazy" decoding="async" /><span className="song-play"><Play size={20} fill="currentColor" /></span>{length && <span className="song-len">{length}</span>}</span>
      <span className="vthumb-title">{title}</span>
      {meta && <span className="vthumb-meta">{meta}</span>}
    </Link>
  );
}

export function MostWatched({ count = 6 }) {
  const top = useMemo(() => [...songs].filter((s) => s.versions.some((v) => v.type === 'video' || v.type === 'track')).sort((a, b) => b.views - a.views).slice(0, count), [count]);
  return (
    <div className="video-grid">
      {top.map((song) => {
        const version = sortedVersions(song)[0];
        return <VideoThumb key={song.id} id={version.id} title={song.title} length={version.length} meta={releaseLabel(song)} />;
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
