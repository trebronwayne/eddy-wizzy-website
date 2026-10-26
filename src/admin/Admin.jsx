import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CalendarDays, Copy, Download, LogOut, Mail, Megaphone, Newspaper, Pencil, Plus, Send, Trash2, Users } from 'lucide-react';
import { auth, canSendEmail, configured, db } from './firebase';

/* What each section of the website can edit. Add a field here and it appears in the form. */
const CONFIG = {
  announcements: {
    label: 'Announcement', plural: 'Announcements', flag: 'active', flagLabel: 'Show on the website', sort: 'createdAt',
    intro: 'A short message in a bar at the top of every page, for example a new release or a show. Visitors can dismiss it.',
    meta: (item) => [item.startsAt && `from ${item.startsAt}`, item.endsAt && `until ${item.endsAt}`].filter(Boolean).join(' · ') || 'No dates set',
    fields: [
      { key: 'title', label: 'Title (only you see this)', required: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true, max: 200, help: 'Keep it short. Up to 200 characters.' },
      { key: 'linkLabel', label: 'Button text', help: 'Optional, for example "Watch now".' },
      { key: 'link', label: 'Link', type: 'link', help: 'Optional. A full web address, or a page on this site such as /music.' },
      { key: 'startsAt', label: 'Show from', type: 'date', help: 'Optional. Leave empty to start straight away.' },
      { key: 'endsAt', label: 'Hide after', type: 'date', help: 'Optional. Leave empty to keep it up until you turn it off.' },
    ],
  },
  news: {
    label: 'News post', plural: 'News', flag: 'published', flagLabel: 'Published', sort: 'date',
    intro: 'Posts for the News page. A post with a future date appears on that day.',
    meta: (item) => item.date,
    fields: [
      { key: 'title', label: 'Headline', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'body', label: 'Text', type: 'textarea', required: true, tall: true, help: 'Leave a blank line between paragraphs.' },
      { key: 'image', label: 'Picture web address', type: 'link', help: 'Optional. A link to an image that starts with https://.' },
      { key: 'linkLabel', label: 'Button text', help: 'Optional, for example "Watch the video".' },
      { key: 'link', label: 'Link', type: 'link', help: 'Optional.' },
    ],
  },
  shows: {
    label: 'Show', plural: 'Shows', flag: 'published', flagLabel: 'Published', sort: 'date',
    intro: 'Upcoming shows. They appear in the Shows section of the home page, with a countdown to the next one. Past shows move to "Past shows" by themselves.',
    meta: (item) => [item.date, item.venue, item.city].filter(Boolean).join(' · '),
    fields: [
      { key: 'title', label: 'Show name', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'time', label: 'Start time', type: 'time', help: 'Optional.' },
      { key: 'venue', label: 'Venue' },
      { key: 'city', label: 'City' },
      { key: 'ticketUrl', label: 'Tickets or details link', type: 'link', help: 'Optional.' },
    ],
  },
};

const sortValue = (value) => (value?.toMillis ? value.toMillis() : value || 0);
const fmtDate = (value) => (value?.toDate ? value.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : value || '');
const linkOk = (value) => !value || /^https?:\/\//i.test(value) || (value.startsWith('/') && !value.startsWith('//'));

/* Live list of a collection (admins can read everything, including hidden items). */
function useLive(name) {
  const [state, setState] = useState({ items: null, error: '' });
  useEffect(() => onSnapshot(collection(db, name),
    (snap) => setState({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })), error: '' }),
    () => setState({ items: [], error: 'Could not load this list. Check that the Firestore rules are published and that your account is listed as an admin (see ADMIN-SETUP.md).' }),
  ), [name]);
  return state;
}

function Field({ field, value, onChange }) {
  const common = { id: `f-${field.key}`, className: 'fl-input', value: value ?? '', onChange: (e) => onChange(e.target.value), maxLength: field.max };
  return (
    <label className="fl-field" htmlFor={common.id}>
      <span>{field.label}{field.required && <em> *</em>}</span>
      {field.type === 'textarea' ? <textarea {...common} rows={field.tall ? 10 : 3} /> : <input {...common} type={field.type === 'link' ? 'text' : field.type || 'text'} inputMode={field.type === 'link' ? 'url' : undefined} />}
      {field.help && <small>{field.help}{field.max ? ` (${(value || '').length}/${field.max})` : ''}</small>}
    </label>
  );
}

/* ---------- Generic list + editor for announcements, news and shows ---------- */
function Manager({ name, notify }) {
  const config = CONFIG[name];
  const { items, error } = useLive(name);
  const [editing, setEditing] = useState(null); // null = list, {} = new, {id,...} = existing
  const rows = useMemo(() => [...(items || [])].sort((a, b) => String(sortValue(b[config.sort])).localeCompare(String(sortValue(a[config.sort])))), [items, config.sort]);

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try { await deleteDoc(doc(db, name, item.id)); notify('Deleted.'); } catch { notify('Could not delete. Please try again.', true); }
  };
  const toggle = async (item) => {
    try { await updateDoc(doc(db, name, item.id), { [config.flag]: !item[config.flag], updatedAt: serverTimestamp() }); } catch { notify('Could not change that. Please try again.', true); }
  };

  if (editing) return <Editor name={name} item={editing} onClose={() => setEditing(null)} notify={notify} />;
  return (
    <section>
      <div className="ad-head"><div><h2>{config.plural}</h2><p>{config.intro}</p></div><button type="button" className="fl-btn fl-btn--primary" onClick={() => setEditing({})}><Plus size={16} /> New {config.label.toLowerCase()}</button></div>
      {error && <p className="ad-error" role="alert">{error}</p>}
      {items === null ? <p className="ad-muted">Loading…</p> : rows.length === 0 && !error ? <div className="fl-card ad-empty">Nothing here yet. Use "New {config.label.toLowerCase()}" to add the first one.</div> : (
        <ul className="fl-card ad-list">
          {rows.map((item) => (
            <li key={item.id}>
              <div className="ad-row-main"><b>{item.title}</b><small>{config.meta(item)}</small></div>
              <span className={`ad-pill ${item[config.flag] ? 'is-live' : ''}`}>{item[config.flag] ? (config.flag === 'active' ? 'Showing' : 'Published') : 'Hidden'}</span>
              <button type="button" className="fl-btn fl-btn--subtle" onClick={() => toggle(item)}>{item[config.flag] ? 'Hide' : 'Show'}</button>
              <button type="button" className="fl-btn fl-btn--subtle" onClick={() => setEditing(item)} aria-label={`Edit ${item.title}`}><Pencil size={15} /> Edit</button>
              <button type="button" className="fl-btn fl-btn--subtle ad-danger" onClick={() => remove(item)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Editor({ name, item, onClose, notify, fields: custom, extra, defaults }) {
  const config = CONFIG[name] || {};
  const fields = custom || config.fields;
  const flag = config.flag;
  const [values, setValues] = useState(() => ({ ...Object.fromEntries(fields.map((f) => [f.key, item[f.key] ?? ''])), ...(flag ? { [flag]: item.id ? Boolean(item[flag]) : true } : {}) }));
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState('');

  const save = async (event) => {
    event.preventDefault();
    const data = {};
    for (const field of fields) {
      const value = String(values[field.key] ?? '').trim();
      if (field.required && !value) return setProblem(`Please fill in "${field.label.replace(/ \(.*\)/, '')}".`);
      if (field.type === 'link' && !linkOk(value)) return setProblem(`"${field.label}" must start with https:// (or / for a page on this site).`);
      data[field.key] = value;
    }
    if (flag) data[flag] = Boolean(values[flag]);
    setSaving(true); setProblem('');
    try {
      if (item.id) await updateDoc(doc(db, name, item.id), { ...data, updatedAt: serverTimestamp() });
      else await addDoc(collection(db, name), { ...defaults, ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      notify('Saved.'); onClose();
    } catch { setProblem('Could not save. Check your connection and try again.'); setSaving(false); }
  };

  return (
    <form className="fl-card ad-form" onSubmit={save} noValidate>
      <h2>{item.id ? 'Edit' : 'New'} {(config.label || 'item').toLowerCase()}</h2>
      {fields.map((field) => <Field key={field.key} field={field} value={values[field.key]} onChange={(v) => setValues((c) => ({ ...c, [field.key]: v }))} />)}
      {flag && <label className="fl-check"><input type="checkbox" checked={values[flag]} onChange={(e) => setValues((c) => ({ ...c, [flag]: e.target.checked }))} /> {config.flagLabel}</label>}
      {extra}
      {problem && <p className="ad-error" role="alert">{problem}</p>}
      <div className="ad-actions"><button type="submit" className="fl-btn fl-btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button><button type="button" className="fl-btn" onClick={() => onClose()}>Cancel</button></div>
    </form>
  );
}

/* ---------- Subscribers ---------- */
function Subscribers({ notify }) {
  const { items, error } = useLive('subscribers');
  const [search, setSearch] = useState('');
  const rows = useMemo(() => [...(items || [])].filter((s) => s.email?.includes(search.trim().toLowerCase())).sort((a, b) => sortValue(b.createdAt) - sortValue(a.createdAt)), [items, search]);
  const emails = (items || []).map((s) => s.email).filter(Boolean);
  const copy = async () => { try { await navigator.clipboard.writeText(emails.join(', ')); notify(`Copied ${emails.length} email addresses.`); } catch { notify('Could not copy. Use Download instead.', true); } };
  const download = () => {
    const csv = ['email,signed_up,source', ...(items || []).map((s) => `${s.email},${fmtDate(s.createdAt)},${s.source || ''}`)].join('\n');
    const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'subscribers.csv' });
    link.click(); URL.revokeObjectURL(link.href);
  };
  const remove = async (s) => { if (window.confirm(`Remove ${s.email}?`)) { try { await deleteDoc(doc(db, 'subscribers', s.id)); } catch { notify('Could not remove.', true); } } };
  return (
    <section>
      <div className="ad-head"><div><h2>Subscribers</h2><p>{items ? `${items.length} ${items.length === 1 ? 'person has' : 'people have'} signed up for emails.` : 'Loading…'}</p></div>
        <div className="ad-actions"><button type="button" className="fl-btn" onClick={copy} disabled={!emails.length}><Copy size={15} /> Copy emails</button><button type="button" className="fl-btn" onClick={download} disabled={!emails.length}><Download size={15} /> Download CSV</button></div></div>
      {error && <p className="ad-error" role="alert">{error}</p>}
      <input className="fl-input ad-search" type="search" placeholder="Search by email" aria-label="Search subscribers" value={search} onChange={(e) => setSearch(e.target.value)} />
      {items && rows.length === 0 ? <div className="fl-card ad-empty">{items.length ? 'No match.' : 'No subscribers yet. The sign-up form is in the footer and on the News page.'}</div> : (
        <ul className="fl-card ad-list">{rows.map((s) => <li key={s.id}><div className="ad-row-main"><b>{s.email}</b><small>{fmtDate(s.createdAt)}{s.source ? ` · ${s.source}` : ''}</small></div><button type="button" className="fl-btn fl-btn--subtle ad-danger" onClick={() => remove(s)} aria-label={`Remove ${s.email}`}><Trash2 size={15} /></button></li>)}</ul>
      )}
    </section>
  );
}

/* ---------- Newsletter ---------- */
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FOOTER = '\n\n—\nEddy Wizzy. You are receiving this because you subscribed on the official website. To stop these emails, reply with the word "unsubscribe".';
const NEWSLETTER_FIELDS = [
  { key: 'subject', label: 'Subject line', required: true, max: 120 },
  { key: 'body', label: 'Message', type: 'textarea', required: true, tall: true, help: 'Plain text. Leave a blank line between paragraphs. An unsubscribe line is added automatically.' },
];

function Newsletter({ notify }) {
  const { items, error } = useLive('newsletters');
  const subs = useLive('subscribers').items || [];
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const rows = useMemo(() => [...(items || [])].sort((a, b) => sortValue(b.createdAt) - sortValue(a.createdAt)), [items]);
  const emails = subs.map((s) => s.email).filter(Boolean);

  const send = async (letter) => {
    if (!emails.length) return notify('There are no subscribers yet.', true);
    if (!window.confirm(`Send "${letter.subject}" to ${emails.length} subscribers now? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const text = letter.body + FOOTER;
      const html = text.split(/\n\s*\n/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
      for (let i = 0; i < emails.length; i += 50) await addDoc(collection(db, 'mail'), { bcc: emails.slice(i, i + 50), message: { subject: letter.subject, text, html } });
      await updateDoc(doc(db, 'newsletters', letter.id), { status: 'sent', sentAt: serverTimestamp(), recipients: emails.length });
      notify(`Sent to ${emails.length} subscribers.`);
    } catch { notify('Sending failed. Nothing was marked as sent.', true); }
    setBusy(false);
  };
  const copyOut = async (letter) => {
    try { await navigator.clipboard.writeText(`${letter.subject}\n\n${letter.body}${FOOTER}`); notify('Copied the message. Paste it into your email app and use "Copy emails" on the Subscribers page for the BCC line.'); } catch { notify('Could not copy.', true); }
  };
  const markSent = async (letter) => { try { await updateDoc(doc(db, 'newsletters', letter.id), { status: 'sent', sentAt: serverTimestamp(), recipients: emails.length }); } catch { notify('Could not update.', true); } };
  const remove = async (letter) => { if (window.confirm(`Delete "${letter.subject}"?`)) { try { await deleteDoc(doc(db, 'newsletters', letter.id)); } catch { notify('Could not delete.', true); } } };

  if (editing) return <Editor name="newsletters" item={editing} fields={NEWSLETTER_FIELDS} defaults={{ status: 'draft' }} onClose={() => setEditing(null)} notify={notify} extra={<p className="ad-muted">Saved as a draft. You choose when to send it from the list.</p>} />;
  return (
    <section>
      <div className="ad-head"><div><h2>Newsletter</h2><p>Write an email to everyone who subscribed. {canSendEmail ? `Sending goes to ${emails.length} ${emails.length === 1 ? 'person' : 'people'}.` : 'Email sending is not switched on yet, so you can write and keep drafts and copy them into your own email app. See ADMIN-SETUP.md to switch on one-click sending.'}</p></div>
        <button type="button" className="fl-btn fl-btn--primary" onClick={() => setEditing({})}><Plus size={16} /> New newsletter</button></div>
      {error && <p className="ad-error" role="alert">{error}</p>}
      {items && rows.length === 0 && !error ? <div className="fl-card ad-empty">No newsletters yet.</div> : (
        <ul className="fl-card ad-list">{rows.map((letter) => (
          <li key={letter.id}>
            <div className="ad-row-main"><b>{letter.subject}</b><small>{letter.status === 'sent' ? `Sent ${fmtDate(letter.sentAt)} to ${letter.recipients ?? '?'} people` : 'Draft'}</small></div>
            <span className={`ad-pill ${letter.status === 'sent' ? 'is-live' : ''}`}>{letter.status === 'sent' ? 'Sent' : 'Draft'}</span>
            {letter.status !== 'sent' && (canSendEmail
              ? <button type="button" className="fl-btn fl-btn--primary" onClick={() => send(letter)} disabled={busy}><Send size={15} /> Send</button>
              : <><button type="button" className="fl-btn" onClick={() => copyOut(letter)}><Copy size={15} /> Copy</button><button type="button" className="fl-btn fl-btn--subtle" onClick={() => markSent(letter)}>Mark as sent</button></>)}
            <button type="button" className="fl-btn fl-btn--subtle" onClick={() => setEditing(letter)}><Pencil size={15} /> {letter.status === 'sent' ? 'View' : 'Edit'}</button>
            <button type="button" className="fl-btn fl-btn--subtle ad-danger" onClick={() => remove(letter)} aria-label={`Delete ${letter.subject}`}><Trash2 size={15} /></button>
          </li>))}
        </ul>
      )}
    </section>
  );
}

/* ---------- Sign-in ---------- */
function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await signInWithEmailAndPassword(auth, email.trim(), password); } catch { setMessage('That email and password do not match.'); setBusy(false); }
  };
  const reset = async () => {
    if (!email.trim()) return setMessage('Type your email address first, then choose "Forgot password".');
    try { await sendPasswordResetEmail(auth, email.trim()); setMessage('If that address has an account, a reset email is on its way.'); } catch { setMessage('Could not send the reset email.'); }
  };
  return (
    <div className="ad-center"><form className="fl-card ad-signin" onSubmit={submit}>
      <img src={`${import.meta.env.BASE_URL}images/logo.webp`} alt="" width="48" height="48" />
      <h1>Website admin</h1><p className="ad-muted">Sign in to manage announcements, news, shows and the newsletter.</p>
      <label className="fl-field"><span>Email</span><input className="fl-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label className="fl-field"><span>Password</span><input className="fl-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {message && <p className="ad-error" role="alert">{message}</p>}
      <button type="submit" className="fl-btn fl-btn--primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <button type="button" className="fl-btn fl-btn--subtle" onClick={reset}>Forgot password</button>
    </form></div>
  );
}

const SECTIONS = [
  ['announcements', 'Announcements', Megaphone], ['news', 'News', Newspaper], ['shows', 'Shows', CalendarDays], ['newsletter', 'Newsletter', Mail], ['subscribers', 'Subscribers', Users],
];

export default function Admin() {
  const [user, setUser] = useState(undefined); // undefined = checking
  const [allowed, setAllowed] = useState(null);
  const [section, setSection] = useState('announcements');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = 'Admin — Eddy Wizzy';
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex,nofollow' });
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  useEffect(() => {
    if (!configured) return undefined;
    return onAuthStateChanged(auth, async (next) => {
      setUser(next); setAllowed(null);
      if (next) { try { setAllowed((await getDoc(doc(db, 'admins', next.uid))).exists()); } catch { setAllowed(false); } }
    });
  }, []);
  const notify = (text, bad = false) => { setToast({ text, bad }); window.setTimeout(() => setToast(null), 4200); };

  let body;
  if (!configured) body = <div className="ad-center"><div className="fl-card ad-signin"><h1>Admin is not set up yet</h1><p className="ad-muted">Add the Firebase settings to the site, as described in ADMIN-SETUP.md, then rebuild.</p><Link className="fl-btn" to="/">Back to the website</Link></div></div>;
  else if (user === undefined) body = <div className="ad-center"><p className="ad-muted">Loading…</p></div>;
  else if (!user) body = <SignIn />;
  else if (allowed === null) body = <div className="ad-center"><p className="ad-muted">Checking your access…</p></div>;
  else if (!allowed) body = <div className="ad-center"><div className="fl-card ad-signin"><h1>No access</h1><p className="ad-muted">{user.email} is signed in but is not an admin of this website. Ask the site owner to add you.</p><button type="button" className="fl-btn" onClick={() => signOut(auth)}>Sign out</button></div></div>;
  else body = (
    <div className="wrap">
      <header className="ad-top"><div className="ad-brand"><img src={`${import.meta.env.BASE_URL}images/logo.webp`} alt="" width="32" height="32" /><b>Website admin</b></div>
        <div className="ad-user"><span>{user.email}</span><Link className="fl-btn fl-btn--subtle" to="/">View website</Link><button type="button" className="fl-btn fl-btn--subtle" onClick={() => signOut(auth)}><LogOut size={15} /> Sign out</button></div></header>
      <div className="ad-shell">
        <nav className="fl-card ad-nav" aria-label="Admin sections">{SECTIONS.map(([key, label, Icon]) => <button key={key} type="button" className={section === key ? 'is-on' : ''} aria-current={section === key ? 'page' : undefined} onClick={() => setSection(key)}><Icon size={16} aria-hidden="true" /> {label}</button>)}</nav>
        <main className="ad-main" key={section}>
          {CONFIG[section] ? <Manager name={section} notify={notify} /> : section === 'newsletter' ? <Newsletter notify={notify} /> : <Subscribers notify={notify} />}
        </main>
      </div>
    </div>
  );
  return <div className="fl ad">{body}{toast && <div className={`ad-toast ${toast.bad ? 'is-bad' : ''}`} role="status">{toast.text}</div>}</div>;
}
