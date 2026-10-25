import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Pause, Play, X, Expand } from 'lucide-react';
import { siteContent as content } from '../data/siteContent';
import { loadFirst } from '../lib/images';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* A word that cycles, e.g. "Afrobeat → Dancehall → Reggae". Static for reduced-motion visitors. */
export function RotatingWord({ words, interval = 2400 }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % words.length), interval);
    return () => window.clearInterval(timer);
  }, [words, interval]);
  return <span className="rotator"><span key={index} className="rotator-word">{words[index]}</span></span>;
}

/* Endless scrolling ticker. The second copy is hidden from screen readers. */
export function Marquee({ items }) {
  const row = (hidden) => (
    <div className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span className="marquee-item" key={`${item}-${i}`}>
          <span className={i % 2 ? 'marquee-text marquee-text--solid' : 'marquee-text'}>{item}</span>
          <Flame size={20} className="marquee-icon" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
  return <div className="marquee" role="presentation"><div className="marquee-track">{row(false)}{row(true)}</div></div>;
}

/* Animated equaliser bars */
export function Equalizer() {
  return <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>;
}

/* Live countdown to a date such as "2026-12-20" (optionally with a time like "19:30") */
export function Countdown({ date, time = '00:00' }) {
  const target = new Date(`${date}T${time}:00`).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const diff = Math.max(0, target - now);
  if (Number.isNaN(target)) return null;
  if (diff === 0) return <p className="countdown-live"><span className="status-dot" /> It’s show time</p>;
  const parts = [
    ['days', Math.floor(diff / 86400000)],
    ['hours', Math.floor((diff / 3600000) % 24)],
    ['mins', Math.floor((diff / 60000) % 60)],
    ['secs', Math.floor((diff / 1000) % 60)],
  ];
  return (
    <div className="countdown" role="timer" aria-label={`${parts[0][1]} days until the show`}>
      {parts.map(([label, value]) => <div key={label}><b>{String(value).padStart(2, '0')}</b><small>{label}</small></div>)}
    </div>
  );
}

/* Loads each photo quietly first, so missing files never show as broken images. */
export function useAvailableImages(items) {
  const [available, setAvailable] = useState(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all(items.map((item) => loadFirst(item.src).then((src) => (src ? { ...item, src } : null))))
      .then((results) => { if (!cancelled) setAvailable(results.filter(Boolean)); });
    return () => { cancelled = true; };
  }, [items]);
  return available;
}

function Lightbox({ items, index, onClose, onMove }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const opener = document.activeElement;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onMove(1);
      if (event.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, [onClose, onMove]);
  const item = items[index];
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <button ref={closeRef} type="button" className="lightbox-btn lightbox-close" aria-label="Close" onClick={onClose}><X size={20} /></button>
      {items.length > 1 && <button type="button" className="lightbox-btn lightbox-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); onMove(-1); }}><ChevronLeft size={22} /></button>}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={item.src} alt={item.alt} />
        <figcaption>{item.caption || item.alt}<span>{index + 1} / {items.length}</span></figcaption>
      </figure>
      {items.length > 1 && <button type="button" className="lightbox-btn lightbox-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); onMove(1); }}><ChevronRight size={22} /></button>}
    </div>
  );
}

/* Photo gallery with filter chips and a full-screen viewer. Hidden until real photos exist. */
export function Gallery({ tags, eyebrow, title, text, id }) {
  const tagKey = tags ? tags.join('|') : '';
  const wanted = useMemo(() => (tagKey ? content.gallery.filter((item) => tagKey.split('|').includes(item.tag)) : content.gallery), [tagKey]);
  const available = useAvailableImages(wanted);
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(null);
  const shown = (available || []).filter((item) => filter === 'All' || item.tag === filter);
  const move = useCallback((step) => setOpen((value) => (value === null ? value : (value + step + shown.length) % shown.length)), [shown.length]);
  const close = useCallback(() => setOpen(null), []);
  if (!available || available.length === 0) return null;
  const chips = ['All', ...new Set(available.map((item) => item.tag))];
  return (
    <section className="section-block wrap gallery" id={id}>
      <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-intro">{text}</p>}</div>
        {chips.length > 2 && <div className="chips" role="group" aria-label="Filter photos">{chips.map((chip) => <button key={chip} type="button" className={`chip ${filter === chip ? 'chip--on' : ''}`} aria-pressed={filter === chip} onClick={() => setFilter(chip)}>{chip}</button>)}</div>}
      </div>
      <div className="gallery-grid">
        {shown.map((item, i) => (
          <button type="button" key={item.src} className="gallery-tile" onClick={() => setOpen(i)} aria-label={`Open photo: ${item.alt}`}>
            <img src={item.src} alt={item.alt} loading="lazy" />
            <span className="gallery-tag">{item.tag}</span>
            <span className="gallery-zoom"><Expand size={16} /></span>
          </button>
        ))}
      </div>
      {open !== null && shown[open] && <Lightbox items={shown} index={open} onClose={close} onMove={move} />}
    </section>
  );
}

/* Short audio preview with a waveform. It appears only when the audio file exists, so nothing breaks before files are added. */
let activeAudio = null;
const formatTime = (value) => (Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}` : '0:00');

function makeBars(seedText, count = 52) {
  let seed = 0;
  for (const char of seedText) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  let previous = 0.5;
  return Array.from({ length: count }, (_, i) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const random = seed / 4294967296;
    previous = previous * 0.45 + random * 0.55; // smoothed, so it reads like a waveform
    return 0.22 + previous * 0.78 * (0.75 + 0.25 * Math.sin(i / 4));
  });
}

export function AudioPreview({ src, title, compact = false }) {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const bars = useMemo(() => makeBars(title), [title]);

  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: 'HEAD' })
      .then((response) => {
        const type = response.headers.get('content-type') || '';
        if (!cancelled && response.ok && /audio|ogg|mpeg|octet-stream/i.test(type)) setAvailable(true);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [src]);

  useEffect(() => () => { if (activeAudio === audioRef.current) activeAudio = null; }, []);
  if (!available) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (activeAudio && activeAudio !== audio) activeAudio.pause(); // only one preview plays at a time
      activeAudio = audio;
      audio.play().catch(() => setPlaying(false));
    } else audio.pause();
  };
  const seekTo = (fraction) => {
    const audio = audioRef.current;
    if (audio && duration) audio.currentTime = Math.max(0, Math.min(1, fraction)) * duration;
  };
  const progress = duration ? time / duration : 0;

  return (
    <div className={`audio-preview ${compact ? 'audio-preview--compact' : ''}`}>
      <button type="button" className="audio-play" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} preview of ${title}`}>
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <div
        className="audio-wave"
        role="slider"
        tabIndex={0}
        aria-label={`Preview position for ${title}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        onClick={(event) => { const box = event.currentTarget.getBoundingClientRect(); seekTo((event.clientX - box.left) / box.width); }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); seekTo(progress + 0.1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); seekTo(progress - 0.1); }
        }}
      >
        {bars.map((height, i) => <span key={i} className={i / bars.length < progress ? 'on' : ''} style={{ height: `${Math.round(height * 100)}%` }} />)}
      </div>
      <span className="audio-time">{playing || time > 0 ? formatTime(time) : 'Preview'}<small> / {formatTime(duration)}</small></span>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setTime(0); }}
      />
    </div>
  );
}

/* Number that counts up once when it scrolls into view (instant for reduced motion) */
export function CountUp({ value, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) { setShown(value); return undefined; }
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 1100);
        setShown(value * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={ref}>{shown.toFixed(decimals)}{suffix}</span>;
}
