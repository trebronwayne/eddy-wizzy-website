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

## Pages

- `/` — Home / hero / releases / video / More Fire
- `/music` — releases and platform links
- `/videos` — embedded YouTube videos
- `/about` — artist biography
- `/more-fire` — More Fire Entertainment page
- `/booking` — bookings and enquiries

## Editing content

Edit **`src/data/siteContent.js`**: artist name, tagline, biography, images, social links, releases, videos,
More Fire copy and booking details.

### Photos

Put approved images in `public/images/` using these names (or change the paths in `siteContent.js`):

| File | Used for |
| --- | --- |
| `eddy-hero.jpg` | Home hero (portrait / vertical crop works best) |
| `eddy-about.jpg` | About sections |
| `more-fire.jpg` | More Fire page hero |
| `my-love-cover.jpg` | "My Love" release artwork |

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
