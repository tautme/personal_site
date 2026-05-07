# Personal Site

A small static site. Open `index.html` in a browser; everything works.

## How to add things

**New essay**
1. Drop an `.html` file in `essays/`
2. Add one line to `index.html`:
   ```html
   <li><a href="essays/your-file.html">Title</a></li>
   ```

**New project**
1. Drop an `.html` file in `projects/`
2. Add one line to `index.html`:
   ```html
   <li><a href="projects/your-file.html">Title</a></li>
   ```

**New photo**
- Name it `1.jpg`, `2.jpg`, `3.jpg`, ... and drop it in `photos/`.
- The gallery loads them automatically. No editing.
- Other extensions work too: `.jpeg`, `.png`, `.webp`, `.gif`.
- Numbers must be sequential — gaps stop the loader.

**New music track**
- Name it `1.mp3`, `2.mp3`, ... and drop it in `music/`.
- Auto-loads as audio players. Same rules as photos.
- Other extensions: `.m4a`, `.ogg`, `.wav`.

**Update bio / about**
- Edit the top paragraphs of `index.html`. That's the only place "about" lives.

## Files

- `index.html` — homepage. The only page you edit when adding content.
- `style.css` — all visual styling.
- `script.js` — auto-loaders for photos and music; reading-progress bar and ambient music for essay pages.
- `essays/`, `projects/` — sub-pages, one HTML file each.
- `photos/`, `music/` — drop numbered files here.

## Hosting

Drop the folder onto Netlify, GitHub Pages, Cloudflare Pages, or any static host. Locally, opening `index.html` in a browser works for everything except the music auto-loader (which uses `fetch` and needs `http://` not `file://`). Run `python3 -m http.server` in the folder for a quick local server.

## Future hooks

- **Buy me a coffee / Patreon** — uncomment the support block at the bottom of `index.html`.
- **Search** — the site is small enough that browser Cmd-F covers most cases. If you want fuzzy search later, [Pagefind](https://pagefind.app/) is the simplest drop-in.
- **Per-user login** — when needed, host on Netlify or Cloudflare and use their built-in access controls. No code changes required.
