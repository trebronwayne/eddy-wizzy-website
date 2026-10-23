import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Play, Disc3, Headphones,
  Globe2, Mic2, Flame, Mail, Smartphone, CalendarDays, MapPin, Copy, Check, Send
} from 'lucide-react';
import SiteLayout, { SocialLinks, BrandIcon } from './components/SiteLayout';
import { siteContent as content } from './data/siteContent';
import { RotatingWord, Marquee, Equalizer, Countdown, Gallery, useTilt, useAvailableImages } from './components/Dynamic';

function Photo({ src, alt, className = '', fallback = 'EW' }) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !src;
  return (
    <div className={`photo-frame ${className}`} {...(showFallback ? { role: 'img', 'aria-label': alt } : {})}>
      {!showFallback ? <img src={src} alt={alt} onError={() => setFailed(true)} /> : null}
      {showFallback && <div className="photo-fallback" aria-hidden="true"><span>{fallback}</span></div>}
    </div>
  );
}

function SectionHeading({ eyebrow, title, text, action, to }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-intro">{text}</p>}</div>{action && <Link className="text-link" to={to}>{action}<ArrowUpRight size={16} /></Link>}</div>;
}

function ReleaseCard({ release, index }) {
  return (
    <a href={release.href} className={`release-card ${index === 0 ? 'release-card--featured' : ''}`} target="_blank" rel="noreferrer">
      <div className={`release-art release-art--${index % 4}`}>
        {release.cover ? <img src={release.cover} alt={`${release.title} cover`} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}
        <div className="release-art-type"><span>{release.title}</span><small>{release.kind}</small></div>
        <span className="release-art-index">0{index + 1}</span>
        <span className="release-play"><Play size={17} fill="currentColor" /></span>
      </div>
      <div className="release-meta"><div><h3>{release.title}</h3><span>{release.kind}</span></div>{release.year && <span className="release-year">{release.year}</span>}</div>
    </a>
  );
}

function VideoFeature({ video, large = false }) {
  return (
    <article className={`video-feature ${large ? 'video-feature--large' : ''}`}>
      <div className="video-embed">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
          title={`${video.title} — Eddy Wizzy`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
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

function HomePage() {
  const featuredVideo = content.videos[0];
  const tilt = useTilt();
  const marqueeItems = [...new Set([...content.genres, content.moreFire.name, ...content.releases.map((release) => release.title), 'Uganda'])];
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
        <div className="hero-visual" {...tilt}>
          <div className="hero-burst" aria-hidden="true" />
          <div className="hero-grid" />
          <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
          <Photo src={content.images.hero} alt={`${content.artistName} portrait`} className="hero-photo" fallback="EW" />
          <div className="hero-chips" aria-hidden="true">{content.genres.map((genre, i) => <span key={genre} className={`hero-chip hero-chip--${i}`}>{genre}</span>)}</div>
          <div className="hero-vertical-label">MORE FIRE ENTERTAINMENT · UGANDA</div>
          <div className="hero-stamp"><span>THE</span><b>EW</b><span>EXPERIENCE</span></div>
          <a className="hero-now" href={content.releases[0].href} target="_blank" rel="noreferrer"><span className="hero-now-play"><Play size={15} fill="currentColor" /></span><span><small>LATEST RELEASE</small><b>{content.releases[0].title}</b></span><Equalizer /></a>
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

      <section className="section-block wrap" id="music">
        <SectionHeading eyebrow="THE SOUND" title="On repeat." text="Explore selected releases and discover the sound behind the name." action="All music" to="/music" />
        <div className="release-grid">{content.releases.slice(0, 3).map((release, index) => <ReleaseCard key={release.title} release={release} index={index} />)}</div>
      </section>

      <section className="video-band"><div className="wrap video-band-inner"><div className="video-band-copy"><p className="eyebrow"><span className="eyebrow-mark" /> WATCH · LISTEN · REPEAT</p><h2>See the sound<br /><em>come alive.</em></h2><p>Official videos, visual stories and moments from the music.</p><Link className="button button--outline" to="/videos">Explore videos <ArrowUpRight size={17} /></Link></div><div className="video-band-content">{featuredVideo && <VideoFeature video={featuredVideo} />}</div></div></section>

      <section className="about-preview wrap">
        <div className="about-preview-image"><Photo src={content.images.about} alt={`${content.artistName} artist portrait`} className="about-photo" fallback="EW" /><div className="image-number">01 / ARTIST</div></div>
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
  return <PageShell eyebrow="LISTEN" title={<>The music.<br /><span>Always moving.</span></>} intro="Explore releases and jump to the platform where you listen." number="01">
    <div className="music-note"><Disc3 size={22} /><span>RELEASES · SINGLES · COLLABORATIONS</span></div>
    <div className="release-grid release-grid--page">{content.releases.map((release, index) => <ReleaseCard key={release.title} release={release} index={index} />)}</div>
    <div className="platform-panel"><div><p className="eyebrow">YOUR NEXT LISTEN</p><h2>Find Eddy on your platform.</h2></div><div className="listen-grid">{content.socialLinks.map((link) => <a key={link.label} className="listen-card" href={link.href} target="_blank" rel="noreferrer"><span className="listen-icon"><BrandIcon name={link.label} size={20} /></span><div><b>{link.label}</b><small>Open on {link.label}</small></div><ArrowUpRight size={16} aria-hidden="true" /></a>)}</div></div>
  </PageShell>;
}

function VideosPage() {
  return <PageShell eyebrow="WATCH" title={<>Visuals that<br /><span>carry the feeling.</span></>} intro="Music videos and visual stories. New videos can be added by editing the site content file." number="02">
    <div className="videos-list">{content.videos.map((video) => <VideoFeature key={video.youtubeId} video={video} large />)}</div>
    <a className="button button--accent youtube-more" href="https://www.youtube.com/results?search_query=Eddy+Wizzy+Uganda+official" target="_blank" rel="noreferrer">Find more Eddy Wizzy videos <ArrowUpRight size={17} /></a>
  </PageShell>;
}

function AboutPage() {
  return <PageShell eyebrow="THE ARTIST" title={<>Meet Eddy<br /><span>Wizzy.</span></>} intro="The voice, the vision and the journey behind the music." number="03">
    <div className="artist-bio-layout"><Photo src={content.images.about} alt={`${content.artistName} portrait`} className="artist-bio-photo" fallback="EW" /><div className="artist-bio-copy"><p className="eyebrow">MUSIC · CULTURE · CONNECTION</p><h2>{content.aboutTitle}</h2><p>{content.biography}</p><SocialLinks /></div></div>
    <div className="genre-row"><span>THE SOUND</span>{content.genres.map((genre, i) => <span className="genre-item" key={genre}>{i > 0 && <i>×</i>}<b>{genre}</b></span>)}</div>
    <div className="glance">{[
      ['Based in', content.locationLine],
      ['Sound', content.genres.join(' · ')],
      ['Creative home', content.moreFire.name],
      ['Latest release', content.releases[0].title + (content.releases[0].year ? ` (${content.releases[0].year})` : '')],
    ].map(([label, value]) => <div className="glance-card" key={label}><small>{label}</small><b>{value}</b></div>)}</div>
    {content.milestones.length > 0 && <div className="timeline-wrap"><p className="eyebrow">THE JOURNEY</p><ol className="timeline">{content.milestones.map((item) => <li key={`${item.year}-${item.title}`}><span>{item.year}</span><div><h3>{item.title}</h3>{item.text && <p>{item.text}</p>}</div></li>)}</ol></div>}
  </PageShell>;
}

function MoreFirePage() {
  const fire = content.moreFire;
  return <div className="more-fire-page">
    <section className="fire-hero wrap"><div className="fire-hero-copy"><p className="eyebrow"><Flame size={14} /> {fire.eyebrow}</p><h1>MORE FIRE<br /><span>ENTERTAINMENT</span><i>.</i></h1><p className="fire-tagline"><span className="sr-only">{fire.headline}</span><span aria-hidden="true">More <RotatingWord words={fire.rotatingWords} /></span></p><p className="fire-intro">{fire.intro}</p><a href="#focus" className="button button--accent">Explore the vision <ArrowDownRight size={17} /></a></div><div className="fire-hero-art"><Photo src={content.images.moreFire} alt="More Fire Entertainment visual" className="fire-photo" fallback="MF" /><div className="fire-art-stamp"><Flame size={22} /><span>MORE<br />FIRE</span></div><div className="fire-art-caption">MUSIC / PEOPLE / CULTURE</div></div></section>
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
      {hasWhatsapp && <a className="contact-option" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"><span><Smartphone size={19} /></span><div><b>WhatsApp enquiries</b><small>Open a conversation</small></div><ArrowUpRight size={18} /></a>}
      <a className="contact-option" href="https://www.youtube.com/results?search_query=Eddy+Wizzy+Uganda+official" target="_blank" rel="noreferrer"><span><Play size={19} /></span><div><b>YouTube</b><small>Videos and music</small></div><ArrowUpRight size={18} /></a>
    </div></div>
    <EnquiryForm />
  </PageShell>;
}

function PageShell({ eyebrow, title, intro, number, children }) {
  return <div className="page-shell"><section className="page-hero wrap"><span className="page-watermark" aria-hidden="true">{eyebrow}</span><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro">{intro}</p></div><span className="page-number">{number} <i>/</i> 04</span></section><div className="wrap page-content">{children}</div><BookingStrip /></div>;
}

function NotFound() {
  return <PageShell eyebrow="NOT FOUND" title={<>This page<br /><span>is off the map.</span></>} intro="The page may have moved. Head back to the homepage." number="00"><Link to="/" className="button button--accent">Back home <ArrowRight size={17} /></Link></PageShell>;
}

export default function App() {
  return <Routes><Route element={<SiteLayout />}><Route index element={<HomePage />} /><Route path="music" element={<MusicPage />} /><Route path="videos" element={<VideosPage />} /><Route path="about" element={<AboutPage />} /><Route path="more-fire" element={<MoreFirePage />} /><Route path="booking" element={<BookingPage />} /><Route path="*" element={<NotFound />} /></Route></Routes>;
}
