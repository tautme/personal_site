# Personal Site

A small static site, kept deliberately simple. Open `index.html` in a browser; everything works.

## How to add things

Everything is added by editing `index.html` directly. No build step, no auto-loaders.

**New project**

Projects live in `projects/` and are named `project001` through `project999`. Two patterns work:

- Standalone file: `projects/project001.html`
- Folder (use this when the project has assets): `projects/project002/index.html`

Then add one line to `index.html` under the Projects section:

```html
<li><a href="projects/project001.html">project001 &mdash; title</a></li>
<li><a href="projects/project002/">project002 &mdash; title</a></li>
```

**New essay**

1. Drop a `.html` file in `essays/` (use `essays/essay-template.html` as a starting point)
2. Add one line to `index.html`:
   ```html
   <li><a href="essays/your-file.html">Title</a></li>
   ```

**New photo**

Drop the file in `photos/` and add one line in the Photos section of `index.html`:

```html
<img src="photos/your-photo.jpg" alt="">
```

**Update bio**

Edit the top paragraphs of `index.html`.

## Files

- `index.html` &mdash; homepage. Bare-bones, all styling inline. The only page you edit when adding content.
- `projects/` &mdash; one file or folder per project (`project001` &hellip; `project999`).
- `essays/` &mdash; one HTML file per essay. Essay pages still use `style.css` and `script.js` for typography and reading-progress bar.
- `photos/` &mdash; image files referenced from `index.html`.
- `music/` &mdash; audio files (currently unused on the homepage).
- `style.css`, `script.js` &mdash; used by essay pages only. The homepage does not depend on them.

## Hosting

Drop the folder onto Netlify, GitHub Pages, Cloudflare Pages, or any static host. Locally, opening `index.html` in a browser works. For essay pages or anything that uses `fetch`, run `python3 -m http.server` in the folder.
