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
  aboutTitle: 'Music is the message.',
  biography: 'Eddy Wizzy is a Ugandan recording artist and performer associated with More Fire Entertainment. His sound moves across Afrobeat, dancehall and reggae.',
  socialLinks: [
    { label: 'X', href: 'https://x.com/Eddywizzymusic', short: 'X' },
    { label: 'SoundCloud', href: 'https://soundcloud.com/eddy-wizzy-music', short: 'SC' },
    { label: 'YouTube', href: 'https://www.youtube.com/results?search_query=Eddy+Wizzy+Uganda+official', short: 'YT' },
    { label: 'Apple Music', href: 'https://music.apple.com/us/artist/eddy-wizzy/1624713344', short: 'AM' },
  ],
  releases: [
    { title: 'My Love', year: '2026', kind: 'Single', href: 'https://youtu.be/MO2nyK7BgJ4', cover: asset('images/my-love-cover.jpg'), featured: true },
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
    text: 'For bookings, collaborations and media enquiries, connect through Eddy Wizzy’s official social channels.',
    // Add only a client-approved public booking email or WhatsApp number.
    email: '',
    whatsappNumber: '', // International format, digits only. Example: 2567XXXXXXXX
  },
};
