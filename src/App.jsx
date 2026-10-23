import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Play, Disc3, Headphones,
  Globe2, Mic2, Flame, Mail, Smartphone
} from 'lucide-react';
import SiteLayout, { SocialLinks } from './components/SiteLayout';
import { siteContent as content } from './data/siteContent';

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

function HomePage() {
  const featuredVideo = content.videos[0];
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="status-line"><span className="status-dot" />{content.heroEyebrow}</div>
          <h1>{content.artistName.split(' ')[0]}<br /><span>WIZZY</span><i>.</i></h1>
          <p className="hero-tagline">{content.heroText}</p>
          <div className="hero-actions"><Link to="/music" className="button button--accent">Explore the music <ArrowUpRight size={17} /></Link><Link to="/about" className="button button--outline">Meet the artist</Link></div>
          <div className="hero-bottom-note"><span className="location-pin"><Globe2 size={14} /></span>{content.locationLine}</div>
        </div>
        <div className="hero-visual">
          <div className="hero-grid" />
          <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
          <Photo src={content.images.hero} alt={`${content.artistName} portrait`} className="hero-photo" fallback="EW" />
          <div className="hero-vertical-label">MORE FIRE ENTERTAINMENT · UGANDA</div>
          <div className="hero-stamp"><span>THE</span><b>EW</b><span>EXPERIENCE</span></div>
          <div className="hero-caption"><span className="caption-line" />{content.artistTagline}</div>
        </div>
        <div className="hero-side-index">01 <span>/</span> 04</div>
      </section>

      <section className="quick-facts wrap" aria-label="Artist quick facts">
        <div className="quick-fact"><span className="fact-icon"><Mic2 size={19} /></span><div><b>Recording artist</b><small>Artist · Performer</small></div></div>
        <div className="quick-fact"><span className="fact-icon"><Headphones size={19} /></span><div><b>Sound in motion</b><small>Afrobeat · Dancehall · Reggae</small></div></div>
        <div className="quick-fact"><span className="fact-icon"><Flame size={19} /></span><div><b>More Fire</b><small>Entertainment</small></div></div>
      </section>

      <section className="section-block wrap" id="music">
        <SectionHeading eyebrow="THE SOUND" title="On repeat." text="Explore selected releases and discover the sound behind the name." action="All music" to="/music" />
        <div className="release-grid">{content.releases.slice(0, 3).map((release, index) => <ReleaseCard key={release.title} release={release} index={index} />)}</div>
      </section>

      <section className="video-band"><div className="wrap video-band-inner"><div className="video-band-copy"><p className="eyebrow"><span className="eyebrow-mark" /> WATCH · LISTEN · REPEAT</p><h2>See the sound<br /><em>come alive.</em></h2><p>Official videos, visual stories and moments from the music.</p><Link className="button button--outline" to="/videos">Explore videos <ArrowUpRight size={17} /></Link></div><div className="video-band-content">{featuredVideo && <VideoFeature video={featuredVideo} />}</div></div></section>

      <section className="about-preview wrap">
        <div className="about-preview-image"><Photo src={content.images.about} alt={`${content.artistName} artist portrait`} className="about-photo" fallback="EW" /><div className="image-number">01 / ARTIST</div></div>
        <div className="about-preview-copy"><p className="eyebrow">BEHIND THE MUSIC</p><h2>{content.aboutTitle}</h2><p>{content.biography}</p><Link to="/about" className="text-link">More about Eddy <ArrowUpRight size={16} /></Link><div className="about-signature">{content.artistName}<span>ARTIST · PERFORMER</span></div></div>
      </section>

      <section className="more-fire-teaser"><div className="wrap more-fire-inner"><div className="fire-mark"><Flame size={54} strokeWidth={1.1} /></div><div className="more-fire-copy"><p className="eyebrow">THE CREATIVE HOME</p><h2>More Fire<br /><span>Entertainment.</span></h2><p>Meet the label and creative platform connected to Eddy Wizzy.</p><Link to="/more-fire" className="button button--accent">Explore More Fire <ArrowUpRight size={17} /></Link></div><div className="fire-watermark">MF<span>.</span></div></div></section>
      <BookingStrip />
    </>
  );
}

function MusicPage() {
  return <PageShell eyebrow="LISTEN" title={<>The music.<br /><span>Always moving.</span></>} intro="Explore releases and jump to the platform where you listen." number="01">
    <div className="music-note"><Disc3 size={22} /><span>RELEASES · SINGLES · COLLABORATIONS</span></div>
    <div className="release-grid release-grid--page">{content.releases.map((release, index) => <ReleaseCard key={release.title} release={release} index={index} />)}</div>
    <div className="platform-panel"><div><p className="eyebrow">YOUR NEXT LISTEN</p><h2>Find Eddy on your platform.</h2></div><SocialLinks /></div>
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
    <div className="genre-row"><span>THE SOUND</span><b>Afrobeat</b><i>×</i><b>Dancehall</b><i>×</i><b>Reggae</b></div>
  </PageShell>;
}

function MoreFirePage() {
  const fire = content.moreFire;
  return <div className="more-fire-page">
    <section className="fire-hero wrap"><div className="fire-hero-copy"><p className="eyebrow"><Flame size={14} /> {fire.eyebrow}</p><h1>MORE FIRE<br /><span>ENTERTAINMENT</span><i>.</i></h1><p className="fire-tagline">{fire.headline}</p><p className="fire-intro">{fire.intro}</p><a href="#focus" className="button button--accent">Explore the vision <ArrowDownRight size={17} /></a></div><div className="fire-hero-art"><Photo src={content.images.moreFire} alt="More Fire Entertainment visual" className="fire-photo" fallback="MF" /><div className="fire-art-stamp"><Flame size={22} /><span>MORE<br />FIRE</span></div><div className="fire-art-caption">MUSIC / PEOPLE / CULTURE</div></div></section>
    <section className="fire-manifesto"><div className="wrap manifesto-inner"><span className="manifesto-number">MF—01</span><h2>A home for<br /><em>what comes next.</em></h2><div><p>{fire.manifesto}</p></div></div></section>
    <section className="section-block wrap" id="focus"><SectionHeading eyebrow="WHAT WE STAND FOR" title="Built around the creative." text="The ideas that shape the music, the people and the projects." /><div className="focus-grid">{fire.focusAreas.map((item) => <article className="focus-card" key={item.number}><span>{item.number}</span><ArrowUpRight className="focus-arrow" size={18} /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
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
  </PageShell>;
}

function PageShell({ eyebrow, title, intro, number, children }) {
  return <div className="page-shell"><section className="page-hero wrap"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro">{intro}</p></div><span className="page-number">{number} <i>/</i> 04</span></section><div className="wrap page-content">{children}</div><BookingStrip /></div>;
}

function NotFound() {
  return <PageShell eyebrow="NOT FOUND" title={<>This page<br /><span>is off the map.</span></>} intro="The page may have moved. Head back to the homepage." number="00"><Link to="/" className="button button--accent">Back home <ArrowRight size={17} /></Link></PageShell>;
}

export default function App() {
  return <Routes><Route element={<SiteLayout />}><Route index element={<HomePage />} /><Route path="music" element={<MusicPage />} /><Route path="videos" element={<VideosPage />} /><Route path="about" element={<AboutPage />} /><Route path="more-fire" element={<MoreFirePage />} /><Route path="booking" element={<BookingPage />} /><Route path="*" element={<NotFound />} /></Route></Routes>;
}
