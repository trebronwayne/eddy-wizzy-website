/**
 * EDITABLE WEBSITE CONTENT
 * Update approved wording, photos, social links, song links and contact details here.
 * For launch, ask Eddy to review names, dates, biographies, photos and all links.
 */

// Builds a URL for a file in /public that works on any host path (local, GitHub Pages project site, custom domain).
const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const siteContent = {
  artistName: 'Eddy Wizzy',
  artistTagline: 'Sound without borders.',
  heroEyebrow: 'UGANDAN RECORDING ARTIST',
  heroText: 'A sound of his own. A story still unfolding.',
  locationLine: 'Northern Uganda · Uganda',
  // Add the artist's approved files to public/images and update these paths.
  images: {
    hero: asset('images/eddy-hero.jpg'),
    about: asset('images/eddy-about.jpg'),
    moreFire: asset('images/more-fire.jpg'),
    myLoveCover: asset('images/my-love-cover.jpg'),
  },
  // Drop photos into public/images using these names. Only photos that exist are shown;
  // with none, the gallery stays hidden. Tags create the filter buttons (Shows, More Fire, Portrait).
  gallery: [
    { src: asset('images/shows-1.jpg'), alt: 'Eddy Wizzy performing on stage in sunglasses', caption: 'Live on stage', tag: 'Shows' },
    { src: asset('images/shows-2.jpg'), alt: 'Eddy Wizzy on stage with the crowd', caption: 'The crowd', tag: 'Shows' },
    { src: asset('images/shows-3.jpg'), alt: 'Eddy Wizzy at a show', caption: 'Show night', tag: 'Shows' },
    { src: asset('images/eddy-hero.jpg'), alt: 'Eddy Wizzy in a red fur coat seated in front of a colourful mural', caption: 'Red fire', tag: 'Portraits' },
    { src: asset('images/more-fire.jpg'), alt: 'Eddy Wizzy in a yellow varsity jacket by a riverside railing', caption: 'By the river', tag: 'Portraits' },
    { src: asset('images/eddy-about.jpg'), alt: 'Eddy Wizzy in an all-white outfit outdoors', caption: 'All white', tag: 'Portraits' },
    { src: asset('images/more-fire-1.jpg'), alt: 'More Fire Entertainment', caption: 'More Fire Entertainment', tag: 'More Fire' },
    { src: asset('images/more-fire-2.jpg'), alt: 'More Fire Entertainment crew', caption: 'The creative home', tag: 'More Fire' },
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
  releases: [
    { title: 'My Love', year: '2026', kind: 'Single', href: 'https://youtu.be/MO2nyK7BgJ4', cover: asset('images/my-love-cover.jpg'), featured: true },
    { title: 'Pyem Tye', year: '', kind: 'Release', href: 'https://www.youtube.com/@eddywizzymusic', cover: asset('images/pyem-tye-cover.jpg'), featured: false },
    { title: 'For You', year: '', kind: 'Single', href: 'https://www.youtube.com/results?search_query=Eddy+Wizzy+For+You', cover: '', featured: false },
    { title: 'Subaru', year: '', kind: 'Single', href: 'https://www.youtube.com/results?search_query=Eddy+Wizzy+Subaru', cover: '', featured: false },
    { title: 'Mood', year: '2026', kind: 'Single', href: 'https://music.apple.com/us/artist/eddy-wizzy/1624713344', cover: '', featured: false },
  ],
  videos: [
    { title: 'My Love', subtitle: 'Official video / YouTube', youtubeId: 'MO2nyK7BgJ4', href: 'https://youtu.be/MO2nyK7BgJ4' },
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
