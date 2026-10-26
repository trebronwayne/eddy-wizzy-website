import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { cmsEnabled, subscribeEmail, useCms } from '../lib/cms';
import { siteContent as content } from '../data/siteContent';

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's own timezone
const isInternal = (href) => href.startsWith('/') && !href.startsWith('//');
const readDismissed = () => { try { return JSON.parse(window.localStorage.getItem('ew-dismissed') || '[]'); } catch { return []; } };

function SmartLink({ href, className, children }) {
  return isInternal(href)
    ? <Link className={className} to={href}>{children}</Link>
    : <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
}

/* ---------- Announcement bar (the newest active announcement inside its dates) ---------- */
export function AnnouncementBar() {
  const { items } = useCms('announcements', 'active');
  const [dismissed, setDismissed] = useState(readDismissed);
  const now = today();
  const current = items
    .filter((item) => item.message && (!item.startsAt || item.startsAt <= now) && (!item.endsAt || item.endsAt >= now))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0];
  const key = current && `${current.id}:${current.updatedAt || ''}`;
  if (!current || dismissed.includes(key)) return null;
  const close = () => {
    const next = [...dismissed.slice(-9), key];
    setDismissed(next);
    try { window.localStorage.setItem('ew-dismissed', JSON.stringify(next)); } catch { /* it will simply show again next visit */ }
  };
  return (
    <div className="announce" role="region" aria-label="Announcement">
      <p>{current.message}{current.link && <SmartLink href={current.link} className="announce-link">{current.linkLabel || 'Learn more'} <ArrowUpRight size={14} aria-hidden="true" /></SmartLink>}</p>
      <button type="button" onClick={close} aria-label="Dismiss announcement"><X size={16} /></button>
    </div>
  );
}

/* ---------- News list: posts built into the site plus posts added in the admin board ---------- */
const imageOk = (src) => /^https:\/\//.test(src || '') || (src || '').startsWith(import.meta.env.BASE_URL);

export function NewsList() {
  const { items, loading } = useCms('news', 'published');
  const posts = [...content.news, ...items].filter((post) => post.title && post.date <= today()).sort((a, b) => b.date.localeCompare(a.date));
  if (!posts.length) return loading
    ? <div className="news-list" aria-busy="true">{[0, 1].map((i) => <div className="news-item" key={i}><div className="sk sk-title" /><div className="sk sk-line" /><div className="sk sk-line sk-line--short" /></div>)}</div>
    : <div className="shows-empty"><div><h3>No news yet.</h3><p>Check back soon.</p></div></div>;
  return (
    <div className="news-list">
      {posts.map((post) => (
        <article className={`news-item ${imageOk(post.image) ? 'has-image' : ''}`} key={post.id}>
          {imageOk(post.image) && <a className="news-img" href={post.image} target="_blank" rel="noreferrer" aria-label={`View the picture for ${post.title}`}><img src={post.image} alt={post.imageAlt || ''} loading="lazy" decoding="async" /></a>}
          <div className="news-text">
            <time dateTime={post.date}>{new Date(`${post.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            <h2>{post.title}</h2>
            {String(post.body || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            {post.link && <SmartLink href={post.link} className="text-link">{post.linkLabel || 'Read more'} <ArrowUpRight size={16} /></SmartLink>}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---------- Newsletter sign-up ---------- */
export function SubscribeForm({ source = 'website' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | ok | exists | error | invalid
  if (!cmsEnabled) return null;
  const submit = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (event.currentTarget.elements.website.value) return; // a bot filled the hidden field
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || value.length > 254) { setState('invalid'); return; }
    setState('sending');
    try { setState(await subscribeEmail(value, source)); setEmail(''); } catch { setState('error'); }
  };
  const message = {
    ok: 'Thank you, you are subscribed.', exists: 'You are already subscribed.',
    error: 'Something went wrong. Please try again in a moment.', invalid: 'Please enter a valid email address.',
  }[state];
  return (
    <form className="subscribe" onSubmit={submit} noValidate>
      <div className="subscribe-row">
        <label className="sr-only" htmlFor={`sub-${source}`}>Email address</label>
        <input id={`sub-${source}`} type="email" inputMode="email" autoComplete="email" placeholder="Your email address" value={email} onChange={(event) => { setEmail(event.target.value); if (state !== 'sending') setState('idle'); }} />
        <input className="subscribe-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" className="button button--accent" disabled={state === 'sending'}>{state === 'sending' ? 'Subscribing…' : 'Subscribe'}</button>
      </div>
      <p className={`subscribe-note ${state === 'error' || state === 'invalid' ? 'is-error' : ''}`} role="status">{message}</p>
    </form>
  );
}
