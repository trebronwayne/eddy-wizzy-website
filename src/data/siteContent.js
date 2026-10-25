/**
 * EDITABLE WEBSITE CONTENT
 * Update approved wording, photos, social links, song links and contact details here.
 * For launch, ask Eddy to review names, dates, biographies, photos and all links.
 */

// Builds a URL for a file in /public that works on any host path (local, GitHub Pages project site, custom domain).
const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

import { songs } from './catalog';

function fromCatalog(id) {
  const song = songs.find((item) => item.id === id);
  const version = song.versions[0];
  return { id, title: song.title, year: '', href: `https://www.youtube.com/watch?v=${version.id}`, youtubeId: version.id, cover: '' };
}

export const siteContent = {
  artistName: 'Eddy Wizzy',
  artistTagline: 'Sound without borders.',
  heroEyebrow: 'UGANDAN RECORDING ARTIST',
  heroText: 'A sound of his own. A story still unfolding.',
  locationLine: 'Northern Uganda · Uganda',
  // Add the artist's approved files to public/images and update these paths.
  images: {
    hero: asset('images/eddy-hero.webp'),
    heroCutout: asset('images/eddy-cutout.webp'),
    aboutCutout: asset('images/eddy-cutout-white.webp'),
    fireCutout: asset('images/eddy-cutout-yellow.webp'),
    about: asset('images/eddy-about.webp'),
    moreFire: asset('images/more-fire.webp'),
    myLoveCover: asset('images/my-love-cover.webp'),
  },
  // Drop photos into public/images using these names. Only photos that exist are shown;
  // with none, the gallery stays hidden. Tags create the filter buttons (Shows, More Fire, Portrait).
  gallery: [
    { src: asset('images/shows-1.webp'), alt: 'Eddy Wizzy performing on stage in sunglasses', caption: 'Live on stage', tag: 'Shows' },
    { src: asset('images/shows-2.webp'), alt: 'Eddy Wizzy on stage with the crowd', caption: 'The crowd', tag: 'Shows' },
    { src: asset('images/shows-3.webp'), alt: 'Eddy Wizzy at a show', caption: 'Show night', tag: 'Shows' },
    { src: asset('images/eddy-hero.webp'), alt: 'Eddy Wizzy in a red fur coat seated in front of a colourful mural', caption: 'Red fire', tag: 'Portraits' },
    { src: asset('images/more-fire.webp'), alt: 'Eddy Wizzy in a yellow varsity jacket by a riverside railing', caption: 'By the river', tag: 'Portraits' },
    { src: asset('images/eddy-about.webp'), alt: 'Eddy Wizzy in an all-white outfit outdoors', caption: 'All white', tag: 'Portraits' },
    { src: asset('images/more-fire-1.webp'), alt: 'More Fire Entertainment', caption: 'More Fire Entertainment', tag: 'More Fire' },
    { src: asset('images/more-fire-2.webp'), alt: 'More Fire Entertainment crew', caption: 'The creative home', tag: 'More Fire' },
  ],
  aboutTitle: 'Music is the message.',
  biography: 'Eddy Wizzy is a Ugandan recording artist and performer associated with More Fire Entertainment. His sound moves across Afrobeat, dancehall and reggae.',
  genres: ['Afrobeat', 'Dancehall', 'Reggae'],
  // Upcoming shows. Leave empty to show a friendly "no dates yet" message.
  // Example: { date: '2026-12-20', title: 'Live set', venue: 'Venue name', city: 'Kampala', href: 'https://...' }
  shows: [],
  // Optional career highlights for the About page. Leave empty to hide the section.
  // Example: { year: '2026', title: 'Released "My Love"', text: 'One short sentence.' }
  milestones: [],
  youtubeChannel: 'https://www.youtube.com/@eddywizzymusic',
  socialLinks: [
    { label: 'YouTube', href: 'https://www.youtube.com/@eddywizzymusic', short: 'YT' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@eddywizzymusic1', short: 'TT' },
    { label: 'Facebook', href: 'https://www.facebook.com/eddywizzymusic', short: 'FB' },
    { label: 'X', href: 'https://x.com/Eddywizzymusic', short: 'X' },
    { label: 'SoundCloud', href: 'https://soundcloud.com/eddy-wizzy-music', short: 'SC' },
    { label: 'Apple Music', href: 'https://music.apple.com/us/artist/eddy-wizzy/1624713344', short: 'AM' },
  ],
  // Latest releases come from src/data/catalog.js (the full song list). Order: newest first.
  releases: [
    { ...fromCatalog('pyem-tye'), kind: 'New release', cover: asset('images/pyem-tye-cover.webp'), credit: 'Prod. Brozy Beats / Artin Pro' },
    { ...fromCatalog('million-dollars'), kind: 'New release', released: 'Aug 22, 2026' },
    { ...fromCatalog('prayer'), kind: 'New release', released: 'Aug 20, 2026' },
  ],
  // Songs that have a short audio preview file at public/audio/<song-id>-preview.mp3 (see README).
  previewIds: ['pyem-tye', 'million-dollars', 'prayer', 'my-love', 'mood', 'for-you', 'imara'],
  videos: [
    { title: 'Pyem Tye', subtitle: 'Official dance video', youtubeId: '4pMxVsvBmWU', href: 'https://www.youtube.com/watch?v=4pMxVsvBmWU' },
  ],
  moreFire: {
    name: 'More Fire Entertainment',
    eyebrow: 'THE CREATIVE HOME',
    headline: 'More vision. More sound. More fire.',
    rotatingWords: ['vision.', 'sound.', 'fire.'],
    intro: 'A creative home for music, collaboration and new projects, connected to the sound of Eddy Wizzy.',
    manifesto: 'Music, people and culture, brought together by a shared drive to create work that moves.',
    focusAreas: [
      { number: '01', title: 'Music & releases', text: 'A home for projects, new sounds and official releases.' },
      { number: '02', title: 'Artist development', text: 'A place to highlight the people and ideas behind the music.' },
      { number: '03', title: 'Collaborations', text: 'A clear starting point for creative partnerships and enquiries.' },
    ],
  },
  booking: {
    heading: 'Let’s make something happen.',
    text: 'For bookings, collaborations and media enquiries, message Eddy Wizzy on WhatsApp or reach out through his official channels.',
    // Add only a client-approved public booking email or WhatsApp number.
    email: '',
    phone: '+256782854006', // shown as a Call button and used for WhatsApp
    whatsappNumber: '256782854006', // International format, digits only. Example: 2567XXXXXXXX
  },
};
