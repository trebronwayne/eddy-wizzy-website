import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Menu, X } from 'lucide-react';
import { siX, siYoutube, siSoundcloud, siApplemusic, siInstagram, siTiktok, siFacebook } from 'simple-icons';
import { siteContent } from '../data/siteContent';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../theme';

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

// Elements that fade up as they scroll into view. Classes are added by JS only, so the page
// stays fully visible without JavaScript or when the visitor prefers reduced motion.
const REVEAL = [
  '.section-heading', '.quick-fact', '.release-card', '.video-band-copy', '.video-band-content',
  '.about-preview-image', '.about-preview-copy', '.more-fire-copy', '.booking-strip-inner > div',
  '.focus-card', '.manifesto-inner > *', '.platform-panel', '.artist-bio-layout > *', '.genre-row',
  '.contact-lead', '.contact-option', '.glance-card', '.show-row', '.shows-empty', '.timeline li', '.enquiry', '.listen-card', '.videos-list > *', '.fire-artist-banner > div:not(.photo-frame)',
].join(',');

function useRouteEffects(pathname) {
  // Start every page at the top, like a normal website.
  useLayoutEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.title = pageTitles[pathname] || 'Page not found — Eddy Wizzy';
  }, [pathname]);

  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    const els = [...document.querySelectorAll(REVEAL)];
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.matches(REVEAL)) : [el];
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 80}ms`;
      el.classList.add('reveal');
      io.observe(el);
    });
    return () => {
      io.disconnect();
      els.forEach((el) => { el.classList.remove('reveal', 'is-visible'); el.style.transitionDelay = ''; });
    };
  }, [pathname]);
}

// Scroll-aware header, reading-progress bar and card spotlight. Everything is throttled with requestAnimationFrame.
function useScrollEffects() {
  const [header, setHeader] = useState({ scrolled: false, hidden: false });
  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
      root.style.setProperty('--scroll-y', `${Math.round(y)}px`);
      setHeader((prev) => {
        const scrolled = y > 24;
        let hidden = prev.hidden;
        if (y < 140 || y < last - 4) hidden = false;
        else if (y > last + 4) hidden = true;
        return scrolled === prev.scrolled && hidden === prev.hidden ? prev : { scrolled, hidden };
      });
      last = y;
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    const SPOT = '.focus-card, .glance-card, .quick-fact, .listen-card, .contact-option, .show-row, .shows-empty, .release-art';
    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return;
      const card = event.target.closest?.(SPOT);
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
  return header;
}

function Header({ scrolled, hidden }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="header-inner wrap">
        <Link to="/" className="wordmark" onClick={close} aria-label="Eddy Wizzy home">
          <span className="wordmark-mark">EW</span>
          <span className="wordmark-name">EDDY WIZZY<span className="wordmark-dot">.</span><small>OFFICIAL WEBSITE</small></span>
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
      {location.pathname === '/more-fire' && <div className="sub-brand-line"><span>PART OF THE</span><b>MORE FIRE ENTERTAINMENT</b><span>UNIVERSE</span></div>}
    </header>
  );
}

function Footer() {
  const { followsSystem, matchSystem } = useTheme();
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-intro">
          <Link to="/" className="footer-brand">EDDY WIZZY<span>.</span></Link>
          <p>Music. Culture. Connection.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <span className="footer-kicker">EXPLORE</span>
          {[...navItems.slice(1), { to: '/booking', label: 'Booking' }].map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </nav>
        <div className="footer-company">
          <span className="footer-kicker">LABEL / CREATIVE HOME</span>
          <Link to="/more-fire">More Fire Entertainment <ArrowUpRight size={14} /></Link>
        </div>
        <SocialLinks compact />
      </div>
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Eddy Wizzy. All rights reserved.</span><span className="footer-meta"><button type="button" className="footer-link" onClick={matchSystem} disabled={followsSystem}>{followsSystem ? 'Theme: matches your device' : 'Match my device theme'}</button></span></div>
    </footer>
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

export default function SiteLayout() {
  const { pathname } = useLocation();
  useRouteEffects(pathname);
  const header = useScrollEffects();
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header scrolled={header.scrolled} hidden={header.hidden} />
      <main id="main"><Outlet /></main>
      <Footer />
      <BackToTop />
    </>
  );
}
