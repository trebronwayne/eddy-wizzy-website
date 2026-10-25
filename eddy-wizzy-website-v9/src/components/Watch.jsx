import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronRight, Link2, Search, SkipBack, SkipForward, X } from 'lucide-react';
import { Equalizer } from './Dynamic';
import { coverUrl, findTrack, thumb, tracks, versionLine, watchPath, watchUrl } from '../lib/tracks';

const YT_ORIGINS = ['https://www.youtube-nocookie.com', 'https://www.youtube.com'];
const PAGE = 20;
const TABS = [
  ['all', 'All', () => true],
  ['songs', 'Songs', (track) => track.kind === 'song'],
  ['live', 'Live', (track) => track.kind === 'live'],
];

function Cover({ id, ...rest }) {
  return <img src={coverUrl(id)} alt="" onError={(event) => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = thumb(id); } }} {...rest} />;
}

function readAutoplay() {
  try { return window.localStorage.getItem('ew-autoplay') !== 'off'; } catch { return true; }
}

export default function WatchPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('v') || '';
  const found = findTrack(requested) || { index: 0, track: tracks[0], version: tracks[0].versions[0] };
  const { track, version } = found;
  const videoId = version.id;

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [limit, setLimit] = useState(PAGE);
  const [autoplay, setAutoplay] = useState(readAutoplay);
  const [copied, setCopied] = useState(false);
  const playerRef = useRef(null);
  const currentRef = useRef(null);

  const list = useMemo(() => {
    const text = query.trim().toLowerCase();
    const match = TABS.find(([key]) => key === tab)[2];
    return tracks.filter((item) => match(item) && (!text || `${item.title} ${item.subtitle}`.toLowerCase().includes(text)));
  }, [query, tab]);

  const position = list.findIndex((item) => item.key === track.key);
  const sequence = position === -1 ? tracks : list;
  const at = position === -1 ? found.index : position;
  const next = sequence[at + 1] || null;
  const previous = sequence[at - 1] || null;

  // The page title follows the song, and the address always holds the video so the link can be shared.
  useEffect(() => { document.title = `${track.title} — Eddy Wizzy`; }, [track.title]);
  useEffect(() => { if (requested !== videoId) setParams({ v: videoId }, { replace: true }); }, [requested, videoId, setParams]);
  useEffect(() => { setLimit((value) => Math.max(value, position + 6)); }, [position]);

  const play = useCallback((item) => {
    setParams({ v: item.versions[0].id });
    const box = playerRef.current?.getBoundingClientRect();
    if (box && box.top < 0) playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [setParams]);

  // Play the next song when this one ends (YouTube reports it through the embedded player).
  const onEnded = useRef(() => {});
  onEnded.current = () => { if (autoplay && next) play(next); };
  useEffect(() => {
    const onMessage = (event) => {
      if (!YT_ORIGINS.includes(event.origin)) return;
      let data = event.data;
      if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }
      const state = data?.event === 'onStateChange' ? data.info : data?.event === 'infoDelivery' ? data.info?.playerState : undefined;
      if (state === 0) onEnded.current();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  const listen = (event) => { try { event.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch { /* the player still works without auto-advance */ } };

  const toggleAutoplay = () => {
    const value = !autoplay;
    setAutoplay(value);
    try { window.localStorage.setItem('ew-autoplay', value ? 'on' : 'off'); } catch { /* choice just won't be remembered */ }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: `${track.title} — Eddy Wizzy`, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { /* cancelled */ }
  };

  // Keep the playing song in view inside the list on large screens.
  useEffect(() => {
    const el = currentRef.current;
    const scroller = el?.closest('.fl-queue-list');
    if (!el || !scroller || scroller.scrollHeight <= scroller.clientHeight) return;
    scroller.scrollTo({ top: el.offsetTop - scroller.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
  }, [track.key]);

  const shown = list.slice(0, limit);
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;

  return (
    <div className="fl">
      <div className="wrap fl-layout">
        <nav className="fl-breadcrumb" aria-label="Breadcrumb">
          <Link to="/music">Music</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Now playing</span>
        </nav>

        <main className="fl-main" id="player">
          <div className="fl-player" ref={playerRef}>
            <iframe
              key={videoId}
              src={embed}
              title={`${track.title} — Eddy Wizzy`}
              onLoad={listen}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <section className="fl-card fl-details" aria-labelledby="fl-title">
            <p className="fl-caption">{track.kind === 'live' ? 'Live performance' : 'Now playing'}{track.isNew && <span className="fl-badge">New</span>}</p>
            <h1 id="fl-title" className="fl-title">{track.title}</h1>
            <p className="fl-subtitle">{track.subtitle}{versionLine(version) ? ` · ${versionLine(version)}` : ''}</p>

            {track.versions.length > 1 && (
              <div className="fl-tabs fl-tabs--pills" role="tablist" aria-label="Choose a version">
                {track.versions.map((item) => (
                  <Link key={item.id} role="tab" aria-selected={item.id === videoId} className={`fl-tab ${item.id === videoId ? 'is-on' : ''}`} to={watchPath(item.id)} replace>{item.label}</Link>
                ))}
              </div>
            )}

            <div className="fl-commandbar" role="toolbar" aria-label="Player actions">
              <button type="button" className="fl-btn" disabled={!previous} onClick={() => previous && play(previous)}><SkipBack size={16} aria-hidden="true" /> Previous</button>
              <button type="button" className="fl-btn fl-btn--primary" disabled={!next} onClick={() => next && play(next)}>Next <SkipForward size={16} aria-hidden="true" /></button>
              <span className="fl-divider" aria-hidden="true" />
              <button type="button" className="fl-btn fl-btn--subtle" onClick={share}>{copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />} {copied ? 'Link copied' : 'Share'}</button>
              <a className="fl-btn fl-btn--subtle" href={watchUrl(videoId)} target="_blank" rel="noreferrer">YouTube <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
            <p className="sr-only" role="status">{copied ? 'Link copied to clipboard' : ''}</p>
          </section>
        </main>

        <aside className="fl-card fl-queue" aria-label="Playlist">
          <div className="fl-queue-head">
            <div><h2>Playlist</h2><p>{list.length} {list.length === 1 ? 'track' : 'tracks'}</p></div>
            <label className="fl-switch"><span>Autoplay</span>
              <button type="button" role="switch" aria-checked={autoplay} onClick={toggleAutoplay}><i /></button>
            </label>
          </div>
          <div className="fl-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE); }} placeholder="Search this playlist" aria-label="Search this playlist" />
            {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setLimit(PAGE); }}><X size={14} /></button>}
          </div>
          <div className="fl-tabs" role="tablist" aria-label="Filter playlist">
            {TABS.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} className={`fl-tab ${tab === key ? 'is-on' : ''}`} onClick={() => { setTab(key); setLimit(PAGE); }}>{label}</button>)}
          </div>
          <ul className="fl-queue-list">
            {shown.map((item) => {
              const current = item.key === track.key;
              const cover = item.versions[0];
              return (
                <li key={item.key} ref={current ? currentRef : undefined}>
                  <Link className={`fl-item ${current ? 'is-current' : ''}`} to={watchPath(cover.id)} aria-current={current ? 'true' : undefined} onClick={(event) => { if (current) { event.preventDefault(); return; } event.preventDefault(); play(item); }}>
                    <span className="fl-thumb">
                      <Cover id={cover.id} loading="lazy" decoding="async" />
                      {current ? <span className="fl-thumb-now"><Equalizer /></span> : cover.length && <span className="fl-len">{cover.length}</span>}
                    </span>
                    <span className="fl-item-text">
                      <b>{item.title}</b>
                      <small>{item.subtitle}</small>
                      {item.isNew && <em>New</em>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && <p className="fl-empty">No tracks match that search.</p>}
          {shown.length < list.length && <button type="button" className="fl-btn fl-more" onClick={() => setLimit((value) => value + PAGE)}>Show more ({list.length - shown.length})</button>}
        </aside>
      </div>
    </div>
  );
}
