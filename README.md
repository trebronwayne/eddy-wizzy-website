# Eddy Wizzy — Official Website (React + Vite)

A responsive multi-page artist website with a dedicated More Fire Entertainment page.
All wording, links and contact details live in one file so corrections are quick.

## Run locally

Requires Node.js 20.19+ (Node 22 recommended).

```bash
npm install
npm run dev
```

Vite prints a local preview URL, usually `http://localhost:5173`.

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Deploy to GitHub Pages (automatic)

The workflow in `.github/workflows/deploy.yml` builds the site and publishes it on every push to `main`.
Pull requests only run the build (to catch errors) and never go live.

**One-time setup**

1. Create a GitHub repository and push this project to the `main` branch.
2. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Open the **Actions** tab. The first run starts on push; after it finishes the site is live at
   `https://<your-username>.github.io/<repository-name>/`.

After that, every push to `main` redeploys automatically. You can also run it by hand from
**Actions → Build and deploy to GitHub Pages → Run workflow**.

How it works, so nothing surprises you:

- The correct base path (for example `/eddy-wizzy-website/`) is detected automatically. Nothing to configure.
- A `404.html` copy of the app is added so direct links and refreshes such as `/music` or `/booking` work.
- Dependencies are pinned and `package-lock.json` is committed so builds are repeatable (`npm ci`).
- **Custom domain:** add it under Settings → Pages. The base path switches to `/` automatically.

## Design and themes

Soft UI (rounded surfaces, gentle raised/inset shadows) with a light and a dark theme.

- The site follows the visitor's device setting on the first visit and keeps following it if they change it.
- The sun/moon button in the header switches theme and remembers the choice. "Match my device theme" in the footer clears the choice.
- All colours live as variables at the top of `src/styles.css` (`:root[data-theme='dark']` and `:root[data-theme='light']`). Change the accent colour there and the whole site follows.
- `index.html` sets the theme before the page paints, so there is no flash of the wrong theme.

## Pages

- `/` — Home / hero / releases / video / More Fire
- `/music` — releases and platform links
- `/videos` — newest video, fan favourites and live performances
- `/watch?v=<youtube-id>` — the player page: big player, playlist with thumbnails, autoplay next, share link
- `/about` — artist biography
- `/more-fire` — More Fire Entertainment page
- `/booking` — bookings and enquiries (includes an enquiry form that builds a ready-to-send message; nothing is stored)

## Editing content

Edit **`src/data/siteContent.js`**: artist name, tagline, biography, images, social links, releases, videos,
More Fire copy and booking details.

### Dynamic parts

- Header hides while scrolling down, returns on scroll up, shrinks slightly and shows a reading-progress bar.
- Home hero: cut-out portrait on a soft disc, a rotating genre word and a live equaliser on the latest release.
- A slow scrolling ticker, a gentle glow on cards under the pointer, and faint outline words behind page titles.
- Shows: the next upcoming show gets a live countdown. Shows move to "Past shows" automatically once their date passes. Add an optional `time: '19:30'` to a show for an exact countdown.
- Gallery with Shows / More Fire filters and a full-screen viewer (arrow keys and Esc work). It stays hidden until photos exist.

### Songs, videos and audio previews

- `src/data/catalog.js` holds every song with its YouTube links (official video, audio, lyrics). The Music page lists them all with search, filters (videos / audio / lyrics) and sorting; every Play / Watch button opens the dedicated player page (`/watch`), where the song plays with the whole playlist beside it. There are no pop-ups. The Videos page shows the newest video, the most watched songs and live performances.
- To add a new song, add an entry at the top of `songs` (copy an existing one) and, if it is a new release, add it to `releases` in `siteContent.js`. Subscriber and view numbers are deliberately not shown anywhere. The `views` value in the song list is only used to order "Fan favourites".
- Cover images for every song and clip are in `public/covers/`, named by the YouTube video id (for example `4pMxVsvBmWU.webp`). For a new song, add `<video-id>.webp` (about 640×360); if the file is missing the site falls back to YouTube's own thumbnail.
- Short audio previews: put 20–30 second MP3 files in `public/audio/` named `<song-id>-preview.mp3` (see `public/audio/README.txt` for names and an ffmpeg command). The waveform player appears by itself once a file exists.
- Cut-out portraits (`eddy-cutout*.webp`) sit on a soft coloured disc. If a cut-out file is missing, the normal framed photo is used. The yellow-jacket cut-out is the roughest; a designer can refine it.

### Install as an app (PWA)

The site can be installed on a phone or computer and opens full-screen like an app, with its own icon.

- Android and desktop Chrome/Edge: an **Install app** button appears in the footer (and the browser's own install option works too).
- iPhone: Safari shows **Add to Home Screen** instructions in the footer.
- After one visit, the pages and photos you saw are saved, so the site still opens without a signal. Videos and links to other sites need internet.
- Icons and name live in `public/manifest.webmanifest` and `public/icons/`. The saved files are managed by `public/sw.js`; when you publish big changes, change `VERSION` at the top of that file so visitors refresh their saved copy.
- It only becomes installable on the real https address (GitHub Pages is fine). `npm run dev` does not register the service worker; test with `npm run build && npm run preview`.

### Extra pages

- `/press` — press kit: short bio (copy button), quick facts, downloadable photos and the booking contact. Photos listed there appear automatically when the files exist.
- `/links` — a single-screen "link in bio" page for TikTok, Instagram and YouTube. Put `https://<your-site>/links` in those bios.
- The green WhatsApp button (bottom right) opens a chat with the number in `siteContent.js` (`booking.whatsappNumber`).
- Videos load only after a tap, which saves visitors' mobile data.
- The More Fire page uses an orange accent so it reads as its own brand.

### Link previews (WhatsApp, Facebook, X)

`public/og-image.jpg` (1200×630) is the preview picture. The workflow fills in the site address automatically at build time, so nothing needs editing. After the first deploy, test the link with the Facebook Sharing Debugger to refresh any cached preview. To change the picture, replace the file with another 1200×630 image.

### Photos format

Photos are WebP to keep the site light. If you add a photo as `.jpg` with the same name, the site falls back to it automatically. Convert and shrink at squoosh.app if photos are large.

### Shows and career highlights

`shows` and `milestones` in `siteContent.js` start empty. With no shows the home page displays a friendly "No dates announced yet" card; with no milestones the About timeline stays hidden. Add entries (examples are in the file comments) and they appear automatically.

### Photos

Put approved images in `public/images/` using these names (or change the paths in `siteContent.js`):

| File | Used for |
| --- | --- |
| `eddy-hero.jpg` | Home hero (portrait / vertical crop works best) |
| `eddy-about.jpg` | About sections |
| `more-fire.jpg` | More Fire page hero |
| `my-love-cover.jpg` | "My Love" release artwork |
| `shows-1.jpg` … `shows-4.jpg` | Gallery (Shows); the first is also the Shows backdrop |
| `more-fire-1.jpg` … `more-fire-4.jpg` | Gallery (More Fire) |

Until a photo exists, a styled monogram is shown, so the site always looks finished.

### Add a YouTube video

Add an object to the `videos` array in `siteContent.js`:

```js
{ title: 'Video title', subtitle: 'Official video / YouTube', youtubeId: 'VIDEO_ID', href: 'https://youtu.be/VIDEO_ID' }
```

### Booking contacts

Set `booking.email` and/or `booking.whatsappNumber` (international digits only, no `+` or spaces) once the client
approves a public contact. They stay hidden until filled in.

## Client review checklist (before going public)

The copy and links below are starting points that must be confirmed by Eddy / More Fire Entertainment.

- [ ] Name spelling, biography and the More Fire Entertainment wording are approved (the More Fire page copy, the "A home for what comes next" line and the three focus areas are placeholder wording).
- [ ] Every social, music and video link is verified. The YouTube link, "For You" and "Subaru" currently point to YouTube *search results*, and "Mood" points to the Apple Music artist page.
- [ ] Approved, high-quality photos and cover art are added, with permission to publish each one.
- [ ] A public booking email or WhatsApp number is added.
- [ ] Hero label, taglines and genre line are confirmed as accurate.
- [ ] Domain, hosting and ongoing website-management scope are agreed.
- [ ] Analytics and privacy wording are added if wanted.

## Stack

React, Vite, React Router, Lucide icons and Simple Icons (brand logos). Custom CSS, no UI framework.
