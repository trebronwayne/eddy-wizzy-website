import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Play, Disc3, Headphones,
  Globe2, Mic2, Flame, Mail, Smartphone, CalendarDays, MapPin, Copy, Check, Send, Phone, Download
} from 'lucide-react';
import SiteLayout, { SocialLinks, BrandIcon } from './components/SiteLayout';
import { siteContent as content } from './data/siteContent';
import { RotatingWord, Marquee, Equalizer, Countdown, Gallery, useAvailableImages } from './components/Dynamic';
import ThemeToggle from './components/ThemeToggle';
import { Catalog, Collaborations, LatestRelease, LivePerformances, MostWatched, StatsStrip } from './components/Catalog';
import { songs as catalogSongs } from './data/catalog';
import { watchPath } from './lib/tracks';
import WatchPage from './components/Watch';
import { useImageSrc } from './lib/images';

function Photo({ src, alt, className = '', fallback = 'EW' }) {
  const [current, onError] = useImageSrc(src);
  const showFallback = !current;
  return (
    <div className={`photo-frame ${className}`} {...(showFallback ? { role: 'img', 'aria-label': alt } : {})}>
      {!showFallback ? <img src={current} alt={alt} decoding="async" onError={onError} /> : null}
      {showFallback && <div className="photo-fallback" aria-hidden="true"><span>{fallback}</span></div>}
    </div>
  );
}

/* Cut-out portrait on a soft tinted disc. Falls back to the framed photo if the cut-out file is missing. */
function CutoutPortrait({ cutout, photo, alt, tint = 'red', className = '', fallback = 'EW' }) {
  const items = useMemo(() => [{ src: cutout }], [cutout]);
  const found = useAvailableImages(items);
  if (found === null) return <div className={`cutout-stage ${className}`} aria-hidden="true" />;
  if (found.length === 0) return <Photo src={photo} alt={alt} className={className} fallback={fallback} />;
  return (
    <div className={`cutout-stage cutout-stage--${tint} ${className}`}>
      <div className="cutout-disc" aria-hidden="true" />
      <img className="cutout-img" src={found[0].src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

function SectionHeading({ eyebrow, title, text, action, to }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-intro">{text}</p>}</div>{action && <Link className="text-link" to={to}>{action}<ArrowUpRight size={16} /></Link>}</div>;
}

function VideoFeature({ video, large = false }) {
  return (
    <article className={`video-feature ${large ? 'video-feature--large' : ''}`}>
      <div className="video-embed">
        <Link className="video-facade" to={watchPath(video.youtubeId)} aria-label={`Play ${video.title}`}>
          <img src={`${import.meta.env.BASE_URL}covers/${video.youtubeId}.webp`} alt="" loading="lazy" decoding="async" onError={(event) => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`; } }} />
          <span className="video-facade-play"><Play size={26} fill="currentColor" /></span>
          <span className="video-facade-note">Press play · opens the player page</span>
        </Link>
      </div>
      <div className="video-meta"><div><p className="eyebrow">{video.subtitle}</p><h3>{video.title}</h3></div><a href={video.href} target="_blank" rel="noreferrer" aria-label={`Open ${video.title} on YouTube`}><ArrowUpRight size={18} /></a></div>
    </article>
  );
}

function BookingStrip() {
  return <section className="booking-strip"><div className="wrap booking-strip-inner"><div><p className="eyebrow">BOOKINGS · COLLABORATIONS · MEDIA</p><h2>{content.booking.heading}</h2><p>{content.booking.text}</p></div><Link to="/booking" className="button button--light">Make an enquiry <ArrowUpRight size={17} /></Link></div></section>;
}

function formatShowDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { day: '—', month: value || 'TBA' };
  return { day: String(date.getDate()).padStart(2, '0'), month: date.toLocaleString('en-GB', { month: 'short' }).toUpperCase() };
}

const showPhotos = content.gallery.filter((item) => item.tag === 'Shows');
const dayStart = (value) => new Date(`${value}T00:00:00`).getTime();

function ShowRow({ show }) {
  const { day, month } = formatShowDate(show.date);
  return (
    <li className="show-row">
      <span className="show-date"><b>{day}</b><small>{month}</small></span>
      <div className="show-info"><h3>{show.title}</h3><p><MapPin size={14} aria-hidden="true" /> {[show.venue, show.city].filter(Boolean).join(' · ')}</p></div>
      {show.href && <a className="button button--soft" href={show.href} target="_blank" rel="noreferrer">Details <ArrowUpRight size={16} /></a>}
    </li>
  );
}

function Shows() {
  const photos = useAvailableImages(showPhotos);
  const photo = photos && photos[0];
  const photoStyle = photo ? { '--photo': `url(${photo.src})` } : undefined;
  const today = new Date().setHours(0, 0, 0, 0);
  const sorted = [...content.shows].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((show) => dayStart(show.date) >= today);
  const past = sorted.filter((show) => dayStart(show.date) < today).reverse();
  const next = upcoming[0];
  return (
    <section className="section-block wrap" id="shows">
      <SectionHeading eyebrow="ON STAGE" title="Upcoming shows." text="Dates, venues and where to catch Eddy live." />
      {next ? (
        <div className={`next-show ${photo ? 'has-photo' : ''}`} style={photoStyle}>
          <div className="next-show-copy">
            <p className="eyebrow"><span className="status-dot" /> NEXT SHOW</p>
            <h3>{next.title}</h3>
            <p className="next-show-where"><MapPin size={15} aria-hidden="true" /> {[next.venue, next.city].filter(Boolean).join(' · ')}</p>
            <Countdown date={next.date} time={next.time} />
            {next.href && <a className="button button--accent" href={next.href} target="_blank" rel="noreferrer">Show details <ArrowUpRight size={16} /></a>}
          </div>
        </div>
      ) : (
        <div className={`shows-empty ${photo ? 'has-photo' : ''}`} style={photoStyle}>
          <span className="fact-icon"><CalendarDays size={20} /></span>
          <div><h3>No dates announced yet.</h3><p>Follow the official channels to hear first when new shows are confirmed.</p></div>
          <SocialLinks compact />
        </div>
      )}
      {upcoming.length > 1 && <ul className="shows-list">{upcoming.slice(1).map((show) => <ShowRow key={`${show.date}-${show.title}`} show={show} />)}</ul>}
      {past.length > 0 && <details className="past-shows"><summary>Past shows ({past.length})</summary><ul className="shows-list">{past.map((show) => <ShowRow key={`${show.date}-${show.title}`} show={show} />)}</ul></details>}
    </section>
  );
}

const enquiryTypes = ['Booking', 'Collaboration', 'Media'];

function EnquiryForm() {
  const [data, setData] = useState({ name: '', type: 'Booking', date: '', location: '', message: '' });
  const [copied, setCopied] = useState(false);
  const email = content.booking.email;
  const phone = content.booking.whatsappNumber.replace(/\D/g, '');
  const hasWhatsapp = phone.length > 5;
  const update = (key) => (event) => { setCopied(false); setData((prev) => ({ ...prev, [key]: event.target.value })); };

  const subject = `${data.type} enquiry — Eddy Wizzy`;
  const body = [
    `Hello, my name is ${data.name || '[your name]'}.`,
    `Enquiry type: ${data.type}`,
    data.date ? `Date: ${data.date}` : null,
    data.location ? `Location: ${data.location}` : null,
    '',
    data.message,
  ].filter((line) => line !== null).join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (email) window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    else if (hasWhatsapp) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    else copy();
  };

  const primary = email ? 'Send by email' : hasWhatsapp ? 'Send on WhatsApp' : 'Copy my enquiry';

  return (
    <form className="enquiry" onSubmit={submit}>
      <h2>Start an enquiry</h2>
      <p className="enquiry-note">Fill this in and it becomes a ready-to-send message. Nothing is stored on this website.</p>
      <fieldset className="segmented">
        <legend>What is this about?</legend>
        {enquiryTypes.map((type) => (
          <label key={type}><input type="radio" name="type" value={type} checked={data.type === type} onChange={update('type')} /><span>{type}</span></label>
        ))}
      </fieldset>
      <div className="field-row">
        <label className="field"><span>Your name</span><input required value={data.name} onChange={update('name')} autoComplete="name" placeholder="Full name" /></label>
        <label className="field"><span>Event date <em>(optional)</em></span><input type="date" value={data.date} onChange={update('date')} /></label>
      </div>
      <label className="field"><span>City / venue <em>(optional)</em></span><input value={data.location} onChange={update('location')} placeholder="e.g. Kampala" /></label>
      <label className="field"><span>Your message</span><textarea required rows={5} value={data.message} onChange={update('message')} placeholder="Tell us about the event, project or request." /></label>
      <div className="enquiry-actions">
        <button type="submit" className="button button--accent">{primary} <Send size={16} /></button>
        {(email || hasWhatsapp) && <button type="button" className="button button--soft" onClick={copy}>{copied ? <>Copied <Check size={16} /></> : <>Copy message <Copy size={16} /></>}</button>}
        {!email && !hasWhatsapp && copied && <span className="copied-note" role="status"><Check size={15} /> Copied. Paste it into a message on any official channel.</span>}
      </div>
    </form>
  );
}

const heroCutoutItems = [{ src: content.images.heroCutout }];

function HomePage() {
  const featuredVideo = content.videos[0];
  const cutoutList = useAvailableImages(heroCutoutItems);
  const cutout = cutoutList && cutoutList[0];
  const topTitles = [...catalogSongs].sort((a, b) => b.views - a.views).slice(0, 6).map((song) => song.title);
  const marqueeItems = [...new Set([...content.genres, content.moreFire.name, ...topTitles, 'Uganda'])];
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="status-line"><span className="status-dot" />{content.heroEyebrow}</div>
          <h1>{content.artistName.split(' ')[0]}<br /><span>WIZZY</span><i>.</i></h1>
          <p className="hero-tagline">{content.heroText}</p>
          <p className="hero-rotator"><span>THE SOUND OF</span><RotatingWord words={content.genres} /></p>
          <div className="hero-actions"><Link to="/music" className="button button--accent">Explore the music <ArrowUpRight size={17} /></Link><Link to="/about" className="button button--outline">Meet the artist</Link></div>
          <div className="hero-bottom-note"><span className="location-pin"><Globe2 size={14} /></span>{content.locationLine}</div>
        </div>
        <div className={`hero-visual ${cutout ? 'hero-visual--cutout' : ''}`}>
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
          {cutout
            ? <img className="hero-cutout" src={cutout.src} alt={`${content.artistName} portrait`} fetchPriority="high" decoding="async" />
            : <Photo src={content.images.hero} alt={`${content.artistName} portrait`} className="hero-photo" fallback="EW" />}
          <div className="hero-vertical-label">MORE FIRE ENTERTAINMENT · UGANDA</div>
          {!cutout && <div className="hero-stamp"><span>THE</span><b>EW</b><span>EXPERIENCE</span></div>}
          <Link className="hero-now" to={watchPath(content.releases[0].youtubeId)}><span className="hero-now-play"><Play size={15} fill="currentColor" /></span><span><small>LATEST RELEASE</small><b>{content.releases[0].title}</b></span><Equalizer /></Link>
          <div className="hero-caption"><span className="caption-line" />{content.artistTagline}</div>
        </div>
        <div className="hero-side-index">01 <span>/</span> 04</div>
      </section>

      <section className="quick-facts wrap" aria-label="Artist quick facts">
        <div className="quick-fact"><span className="fact-icon"><Mic2 size={19} /></span><div><b>Recording artist</b><small>Artist · Performer</small></div></div>
        <div className="quick-fact"><span className="fact-icon"><Headphones size={19} /></span><div><b>Sound in motion</b><small>Afrobeat · Dancehall · Reggae</small></div></div>
        <div className="quick-fact"><span className="fact-icon"><Flame size={19} /></span><div><b>More Fire</b><small>Entertainment</small></div></div>
      </section>

      <Marquee items={marqueeItems} />

      <StatsStrip />

      <LatestRelease />

      <section className="video-band"><div className="wrap video-band-inner"><div className="video-band-copy"><p className="eyebrow"><span className="eyebrow-mark" /> WATCH · LISTEN · REPEAT</p><h2>See the sound<br /><em>come alive.</em></h2><p>Official videos, visual stories and moments from the music.</p><Link className="button button--outline" to="/videos">Explore videos <ArrowUpRight size={17} /></Link></div><div className="video-band-content">{featuredVideo && <VideoFeature video={featuredVideo} />}</div></div></section>

      <section className="about-preview wrap">
        <div className="about-preview-image"><CutoutPortrait cutout={content.images.aboutCutout} photo={content.images.about} alt={`${content.artistName} artist portrait`} tint="green" className="about-photo" /><div className="image-number">01 / ARTIST</div></div>
        <div className="about-preview-copy"><p className="eyebrow">BEHIND THE MUSIC</p><h2>{content.aboutTitle}</h2><p>{content.biography}</p><Link to="/about" className="text-link">More about Eddy <ArrowUpRight size={16} /></Link><div className="about-signature">{content.artistName}<span>ARTIST · PERFORMER</span></div></div>
      </section>

      <Gallery eyebrow="MOMENTS" title="In the moment." text="Live shows, the crew and the work behind the sound." id="gallery" />

      <section className="more-fire-teaser"><div className="wrap more-fire-inner"><div className="fire-mark"><Flame size={54} strokeWidth={1.1} /></div><div className="more-fire-copy"><p className="eyebrow">THE CREATIVE HOME</p><h2>More Fire<br /><span>Entertainment.</span></h2><p>Meet the label and creative platform connected to Eddy Wizzy.</p><Link to="/more-fire" className="button button--accent">Explore More Fire <ArrowUpRight size={17} /></Link></div><div className="fire-watermark">MF<span>.</span></div></div></section>
      <Shows />
      <BookingStrip />
    </>
  );
}

function MusicPage() {
  return <PageShell eyebrow="LISTEN" title={<>The music.<br /><span>Always moving.</span></>} intro="Every song, with its video, audio and lyrics versions. Press play right here, or open it on YouTube." number="01">
    <div className="music-note"><Disc3 size={22} /><span>{catalogSongs.length} SONGS · VIDEOS · AUDIO · LYRICS</span></div>
    <Catalog />
    <Collaborations />
    <div className="platform-panel"><div><p className="eyebrow">YOUR NEXT LISTEN</p><h2>Find Eddy on your platform.</h2></div><div className="listen-grid">{content.socialLinks.map((link) => <a key={link.label} className="listen-card" href={link.href} target="_blank" rel="noreferrer"><span className="listen-icon"><BrandIcon name={link.label} size={20} /></span><div><b>{link.label}</b><small>Open on {link.label}</small></div><ArrowUpRight size={16} aria-hidden="true" /></a>)}</div></div>
  </PageShell>;
}

function VideosPage() {
  return <PageShell eyebrow="WATCH" title={<>Visuals that<br /><span>carry the feeling.</span></>} intro="The newest video, the most watched songs and live performances from Uganda, South Sudan and London." number="02">
    <div className="videos-list">{content.videos.map((video) => <VideoFeature key={video.youtubeId} video={video} large />)}</div>
    <div className="video-section"><p className="eyebrow">FAN FAVOURITES</p><h2>The ones everyone plays.</h2><MostWatched /></div>
    <div className="video-section"><p className="eyebrow">ON STAGE</p><h2>Live performances.</h2><LivePerformances /></div>
    <div className="video-actions">
      <a className="button button--accent youtube-more" href={content.youtubeChannel} target="_blank" rel="noreferrer">Visit the YouTube channel <ArrowUpRight size={17} /></a>
      <Link className="button button--soft youtube-more" to="/music">Browse all {catalogSongs.length} songs</Link>
    </div>
  </PageShell>;
}

function AboutPage() {
  return <PageShell eyebrow="THE ARTIST" title={<>Meet Eddy<br /><span>Wizzy.</span></>} intro="The voice, the vision and the journey behind the music." number="03">
    <div className="artist-bio-layout"><CutoutPortrait cutout={content.images.aboutCutout} photo={content.images.about} alt={`${content.artistName} portrait`} tint="green" className="artist-bio-photo" /><div className="artist-bio-copy"><p className="eyebrow">MUSIC · CULTURE · CONNECTION</p><h2>{content.aboutTitle}</h2><p>{content.biography}</p><SocialLinks /></div></div>
    <div className="genre-row"><span>THE SOUND</span>{content.genres.map((genre, i) => <span className="genre-item" key={genre}>{i > 0 && <i>×</i>}<b>{genre}</b></span>)}</div>
    <div className="glance">{[
      ['Role', 'Singer & songwriter'],
      ['Based in', content.locationLine],
      ['Sound', content.genres.join(' · ')],
      ['Creative home', content.moreFire.name],
      ['Latest release', content.releases[0].title],
      ['Songs', `${Math.floor(catalogSongs.length / 5) * 5}+ released`],
    ].map(([label, value]) => <div className="glance-card" key={label}><small>{label}</small><b>{value}</b></div>)}</div>
    {content.milestones.length > 0 && <div className="timeline-wrap"><p className="eyebrow">THE JOURNEY</p><ol className="timeline">{content.milestones.map((item) => <li key={`${item.year}-${item.title}`}><span>{item.year}</span><div><h3>{item.title}</h3>{item.text && <p>{item.text}</p>}</div></li>)}</ol></div>}
  </PageShell>;
}

function MoreFirePage() {
  const fire = content.moreFire;
  return <div className="more-fire-page">
    <section className="fire-hero wrap"><div className="fire-hero-copy"><p className="eyebrow"><Flame size={14} /> {fire.eyebrow}</p><h1>MORE FIRE<br /><span>ENTERTAINMENT</span><i>.</i></h1><p className="fire-tagline"><span className="sr-only">{fire.headline}</span><span aria-hidden="true">More <RotatingWord words={fire.rotatingWords} /></span></p><p className="fire-intro">{fire.intro}</p><a href="#focus" className="button button--accent">Explore the vision <ArrowDownRight size={17} /></a></div><div className="fire-hero-art"><CutoutPortrait cutout={content.images.fireCutout} photo={content.images.moreFire} alt="Eddy Wizzy for More Fire Entertainment" tint="yellow" className="fire-photo" fallback="MF" /><div className="fire-art-stamp"><Flame size={22} /><span>MORE<br />FIRE</span></div><div className="fire-art-caption">MUSIC / PEOPLE / CULTURE</div></div></section>
    <section className="fire-manifesto"><div className="wrap manifesto-inner"><span className="manifesto-number">MF—01</span><h2>A home for<br /><em>what comes next.</em></h2><div><p>{fire.manifesto}</p></div></div></section>
    <section className="section-block wrap" id="focus"><SectionHeading eyebrow="WHAT WE STAND FOR" title="Built around the creative." text="The ideas that shape the music, the people and the projects." /><div className="focus-grid">{fire.focusAreas.map((item) => <article className="focus-card" key={item.number}><span>{item.number}</span><ArrowUpRight className="focus-arrow" size={18} /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
    <Gallery tags={['More Fire']} eyebrow="THE CREATIVE HOME" title="Inside More Fire." text="Moments from the people and sessions behind the sound." id="more-fire-gallery" />
    <section className="fire-artist-banner wrap"><div><p className="eyebrow">ARTIST / MORE FIRE ENTERTAINMENT</p><h2>One vision.<br /><span>Many possibilities.</span></h2></div><Photo src={content.images.hero} alt={`${content.artistName} portrait`} className="fire-artist-photo" fallback="EW" /><Link to="/music" className="button button--light">Explore Eddy's music <ArrowUpRight size={17} /></Link></section>
    <BookingStrip />
  </div>;
}

function BookingPage() {
  const hasEmail = Boolean(content.booking.email);
  const phone = content.booking.whatsappNumber.replace(/\D/g, '');
  const hasWhatsapp = phone.length > 5;
  return <PageShell eyebrow="GET IN TOUCH" title={<>Let’s make<br /><span>something happen.</span></>} intro={content.booking.text} number="04">
    <div className="contact-layout"><div className="contact-lead"><span className="contact-icon"><Mail size={24} /></span><h2>Let’s connect.</h2><p>For shows, bookings, features, collaborations and media enquiries, use the official channels below.</p><SocialLinks /></div><div className="contact-options">
      {hasEmail && <a className="contact-option" href={`mailto:${content.booking.email}`}><span><Mail size={19} /></span><div><b>Booking email</b><small>{content.booking.email}</small></div><ArrowUpRight size={18} /></a>}
      {content.booking.phone && <a className="contact-option" href={`tel:${content.booking.phone.replace(/\s/g, '')}`}><span><Phone size={19} /></span><div><b>Call</b><small>{content.booking.phone}</small></div><ArrowUpRight size={18} /></a>}
      {hasWhatsapp && <a className="contact-option" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"><span><Smartphone size={19} /></span><div><b>WhatsApp enquiries</b><small>Chat on WhatsApp</small></div><ArrowUpRight size={18} /></a>}
      <a className="contact-option" href={content.youtubeChannel} target="_blank" rel="noreferrer"><span><Play size={19} /></span><div><b>YouTube channel</b><small>Videos and music</small></div><ArrowUpRight size={18} /></a>
    </div></div>
    <EnquiryForm />
  </PageShell>;
}

function PageShell({ eyebrow, title, intro, number, children }) {
  return <div className="page-shell"><section className="page-hero wrap"><span className="page-watermark" aria-hidden="true">{eyebrow}</span><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro">{intro}</p></div>{number && <span className="page-number">{number} <i>/</i> 04</span>}</section><div className="wrap page-content">{children}</div><BookingStrip /></div>;
}

function NotFound() {
  return <PageShell eyebrow="NOT FOUND" title={<>This page<br /><span>is off the map.</span></>} intro="The page may have moved. Head back to the homepage." number="00"><Link to="/" className="button button--accent">Back home <ArrowRight size={17} /></Link></PageShell>;
}

const pressItems = [
  { src: content.images.heroCutout, label: 'Cut-out — red coat', file: 'eddy-wizzy-cutout-red' },
  { src: content.images.fireCutout, label: 'Cut-out — yellow jacket', file: 'eddy-wizzy-cutout-yellow' },
  { src: content.images.aboutCutout, label: 'Cut-out — all white', file: 'eddy-wizzy-cutout-white' },
  { src: content.images.hero, label: 'Portrait — red coat', file: 'eddy-wizzy-red-coat' },
  { src: content.images.moreFire, label: 'Portrait — yellow jacket', file: 'eddy-wizzy-yellow-jacket' },
  { src: content.images.about, label: 'Portrait — all white', file: 'eddy-wizzy-all-white' },
  ...content.gallery.filter((item) => item.tag === 'Shows').map((item, i) => ({ src: item.src, label: item.caption, file: `eddy-wizzy-live-${i + 1}` })),
];

function PressPage() {
  const photos = useAvailableImages(pressItems);
  const [copied, setCopied] = useState(false);
  const phone = content.booking.whatsappNumber.replace(/\D/g, '');
  const copyBio = async () => {
    try { await navigator.clipboard.writeText(content.biography); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); }
  };
  const facts = [
    ['Name', content.artistName],
    ['Based in', content.locationLine],
    ['Sound', content.genres.join(' · ')],
    ['Creative home', content.moreFire.name],
    ['Latest release', content.releases[0].title],
    ['Songs', `${Math.floor(catalogSongs.length / 5) * 5}+ released`],
  ];
  return <PageShell eyebrow="PRESS KIT" title={<>Everything<br /><span>you need.</span></>} intro="Biography, photos and contact details for media, promoters and partners.">
    <div className="press-bio">
      <div><p className="eyebrow">SHORT BIOGRAPHY</p><p className="press-bio-text">{content.biography}</p></div>
      <button type="button" className="button button--soft" onClick={copyBio}>{copied ? <>Copied <Check size={16} /></> : <>Copy bio <Copy size={16} /></>}</button>
    </div>
    <div className="glance">{facts.map(([label, value]) => <div className="glance-card" key={label}><small>{label}</small><b>{value}</b></div>)}</div>
    {photos && photos.length > 0 && <div className="press-photos">
      <p className="eyebrow">PHOTOS · FREE TO USE FOR PRESS AND PROMOTION OF EDDY WIZZY</p>
      <div className="press-grid">{photos.map((photo) => {
        const ext = photo.src.split('?')[0].split('.').pop();
        return <figure className="press-item" key={photo.src}><div className="press-thumb"><img src={photo.src} alt={photo.label} loading="lazy" decoding="async" /></div><figcaption><span>{photo.label}</span><a href={photo.src} download={`${photo.file}.${ext}`} aria-label={`Download ${photo.label}`}><Download size={16} /></a></figcaption></figure>;
      })}</div>
    </div>}
    <div className="press-contact">
      <h2>Media and booking contact</h2>
      <p>For interviews, features, bookings and collaborations.</p>
      <div className="enquiry-actions">
        {phone.length > 5 && <a className="button button--accent" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={16} /></a>}
        {content.booking.phone && <a className="button button--soft" href={`tel:${content.booking.phone.replace(/\s/g, '')}`}>Call {content.booking.phone}</a>}
        <Link className="button button--soft" to="/booking">Enquiry form <ArrowRight size={16} /></Link>
      </div>
    </div>
  </PageShell>;
}

function LinksPage() {
  useEffect(() => { document.title = 'Eddy Wizzy — Links'; }, []);
  const phone = content.booking.whatsappNumber.replace(/\D/g, '');
  const latest = content.releases[0];
  const others = content.socialLinks.filter((link) => link.label !== 'YouTube');
  return (
    <main className="links-page" id="main">
      <div className="links-top"><Link to="/" className="links-home" aria-label="Eddy Wizzy website home">EW<span>.</span></Link><ThemeToggle /></div>
      <div className="links-card">
        <Photo src={content.images.about} alt={`${content.artistName} portrait`} className="links-avatar" fallback="EW" />
        <h1>{content.artistName}</h1>
        <p className="links-sub">Ugandan recording artist · {content.moreFire.name}</p>
        <div className="links-list">
          <Link className="links-btn links-btn--main" to={watchPath(latest.youtubeId)}><Play size={18} fill="currentColor" /><span><b>Watch: {latest.title}</b><small>Latest release</small></span><ArrowRight size={17} /></Link>
          <a className="links-btn" href={content.youtubeChannel} target="_blank" rel="noreferrer"><BrandIcon name="YouTube" size={18} /><span><b>Watch on YouTube</b><small>Videos and music</small></span><ArrowUpRight size={17} /></a>
          {phone.length > 5 && <a className="links-btn" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"><Smartphone size={18} /><span><b>WhatsApp</b><small>Bookings and enquiries</small></span><ArrowUpRight size={17} /></a>}
          <Link className="links-btn" to="/music"><Headphones size={18} /><span><b>All songs and videos</b><small>{catalogSongs.length} songs to watch and listen</small></span><ArrowRight size={17} /></Link>
          <Link className="links-btn" to="/booking"><Mail size={18} /><span><b>Book Eddy Wizzy</b><small>Shows, features, collaborations</small></span><ArrowRight size={17} /></Link>
          {others.map((link) => <a key={link.label} className="links-btn" href={link.href} target="_blank" rel="noreferrer"><BrandIcon name={link.label} size={18} /><span><b>{link.label}</b></span><ArrowUpRight size={17} /></a>)}
          <Link className="links-btn" to="/"><Globe2 size={18} /><span><b>Full website</b><small>Music, videos, About, More Fire</small></span><ArrowRight size={17} /></Link>
        </div>
      </div>
      <p className="links-foot">© {new Date().getFullYear()} {content.artistName} · {content.moreFire.name}</p>
    </main>
  );
}

export default function App() {
  return <Routes><Route path="links" element={<LinksPage />} /><Route element={<SiteLayout />}><Route index element={<HomePage />} /><Route path="music" element={<MusicPage />} /><Route path="watch" element={<WatchPage />} /><Route path="videos" element={<VideosPage />} /><Route path="about" element={<AboutPage />} /><Route path="more-fire" element={<MoreFirePage />} /><Route path="booking" element={<BookingPage />} /><Route path="press" element={<PressPage />} /><Route path="*" element={<NotFound />} /></Route></Routes>;
}
