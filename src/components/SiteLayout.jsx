import { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Download, Menu, X } from 'lucide-react';
import { siX, siYoutube, siSoundcloud, siApplemusic, siInstagram, siTiktok, siFacebook, siWhatsapp } from 'simple-icons';
import { siteContent } from '../data/siteContent';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../theme';
import { usePwaInstall } from '../pwa';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/music', label: 'Music' },
  { to: '/videos', label: 'Videos' },
  { to: '/about', label: 'About' },
  { to: '/more-fire', label: 'More Fire' },
];

const pageTitles = {
  '/': 'Eddy Wizzy — Official Website',
  '/music': 'Music — Eddy Wizzy',
  '/videos': 'Videos — Eddy Wizzy',
  '/about': 'About — Eddy Wizzy',
  '/more-fire': 'More Fire Entertainment — Eddy Wizzy',
  '/booking': 'Booking & Enquiries — Eddy Wizzy',
  '/press': 'Press kit — Eddy Wizzy',
};

const brandIcons = {
  x: siX,
  youtube: siYoutube,
  soundcloud: siSoundcloud,
  'apple music': siApplemusic,
  instagram: siInstagram,
  tiktok: siTiktok,
  facebook: siFacebook,
};

export function BrandIcon({ name, size = 16 }) {
  const icon = brandIcons[name.toLowerCase()];
  if (!icon) return <ArrowUpRight size={size} aria-hidden="true" />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={icon.path} />
    </svg>
  );
}

export function SocialLinks({ compact = false }) {
  return (
    <div className={`social-links ${compact ? 'social-links--compact' : ''}`}>
      {siteContent.socialLinks.map((social) => (
        <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>
          <BrandIcon name={social.label} />{!compact && <span>{social.label}</span>}
        </a>
      ))}
    </div>
  );
}

function useRouteEffects(pathname) {
  // Start every page at the top, like a normal website.
  useLayoutEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/watch') return; // the player page sets its own title (the song name)
    document.title = pageTitles[pathname] || 'Page not found — Eddy Wizzy';
  }, [pathname]);
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link to="/" className="wordmark" onClick={close} aria-label="Eddy Wizzy home">
          <img className="wordmark-mark" src={`${import.meta.env.BASE_URL}images/logo.webp`} alt="" width="36" height="36" />
          <span className="wordmark-name">EDDY WIZZY<span className="wordmark-dot">.</span></span>
        </Link>
        <div className="header-actions">
          <ThemeToggle />
          <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav className={`main-nav ${open ? 'main-nav--open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={close} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          <Link className="nav-booking" to="/booking" onClick={close}>Booking <ArrowUpRight size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { followsSystem, matchSystem } = useTheme();
  const { state: installState, install } = usePwaInstall();
  const [iosHint, setIosHint] = useState(false);
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-intro">
          <Link to="/" className="footer-brand">EDDY WIZZY<span>.</span></Link>
          <p>Music. Culture. Connection.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <span className="footer-kicker">EXPLORE</span>
          {[...navItems.slice(1), { to: '/booking', label: 'Booking' }, { to: '/press', label: 'Press kit' }, { to: '/links', label: 'Links' }].map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </nav>
        <div className="footer-company">
          <span className="footer-kicker">LABEL / CREATIVE HOME</span>
          <Link to="/more-fire">More Fire Entertainment <ArrowUpRight size={14} /></Link>
        </div>
        <SocialLinks compact />
      </div>
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Eddy Wizzy. All rights reserved.</span><span className="footer-meta"><button type="button" className="footer-link" onClick={matchSystem} disabled={followsSystem}>{followsSystem ? 'Theme: matches your device' : 'Match my device theme'}</button>
          {installState === 'prompt' && <button type="button" className="install-btn" onClick={install}><Download size={14} aria-hidden="true" /> Install app</button>}
          {installState === 'ios' && <button type="button" className="install-btn" aria-expanded={iosHint} onClick={() => setIosHint((value) => !value)}><Download size={14} aria-hidden="true" /> Add to Home Screen</button>}
          {installState === 'ios' && iosHint && <span className="install-hint" role="status">In Safari, tap the Share button, then “Add to Home Screen”.</span>}
        </span></div>
    </footer>
  );
}

function WhatsAppButton() {
  const number = siteContent.booking.whatsappNumber.replace(/\D/g, '');
  if (number.length < 6) return null;
  const text = encodeURIComponent('Hello, I would like to ask about Eddy Wizzy.');
  return (
    <a className="whatsapp-fab" href={`https://wa.me/${number}?text=${text}`} target="_blank" rel="noreferrer" aria-label="Chat with Eddy Wizzy's team on WhatsApp">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d={siWhatsapp.path} /></svg>
    </a>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button type="button" className={`back-to-top ${show ? 'back-to-top--show' : ''}`} aria-label="Back to top" tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}

function PageSkeleton() {
  return (
    <div className="skeleton" role="status" aria-label="Loading page">
      <div className="wrap">
        <div className="sk sk-title" /><div className="sk sk-line" /><div className="sk sk-line sk-line--short" />
        <div className="sk-grid">{Array.from({ length: 8 }, (_, i) => <div className="sk-card" key={i}><div className="sk sk-thumb" /><div className="sk sk-line" /><div className="sk sk-line sk-line--short" /></div>)}</div>
      </div>
    </div>
  );
}

// A short skeleton while moving between pages, so a page never "pops" in half-drawn.
function useSkeleton(pathname) {
  const [ready, setReady] = useState(pathname);
  useEffect(() => {
    if (ready === pathname) return undefined;
    const timer = window.setTimeout(() => setReady(pathname), 280);
    return () => window.clearTimeout(timer);
  }, [pathname, ready]);
  return ready !== pathname;
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  useRouteEffects(pathname);
  const loading = useSkeleton(pathname);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">{loading ? <PageSkeleton /> : <Suspense fallback={<PageSkeleton />}><Outlet /></Suspense>}</main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </>
  );
}
