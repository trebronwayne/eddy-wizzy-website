import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { siX, siYoutube, siSoundcloud, siApplemusic, siInstagram } from 'simple-icons';
import { siteContent } from '../data/siteContent';

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
};

function BrandIcon({ name, size = 16 }) {
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
  '.contact-lead', '.contact-option', '.videos-list > *', '.fire-artist-banner > div:not(.photo-frame)',
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

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link to="/" className="wordmark" onClick={close} aria-label="Eddy Wizzy home">
          <span className="wordmark-mark">EW</span>
          <span className="wordmark-name">EDDY WIZZY<span className="wordmark-dot">.</span><small>OFFICIAL WEBSITE</small></span>
        </Link>
        <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
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
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Eddy Wizzy. All rights reserved.</span><span>Built for the music.</span></div>
    </footer>
  );
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  useRouteEffects(pathname);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
    </>
  );
}
