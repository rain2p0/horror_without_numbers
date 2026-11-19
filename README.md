# Rite of Spring

A minimal, static reader for the Iron Lung comic. The landing page lists the two sessions in order. Select a title page to open that session in the reader.

- Phones: open at the start of the selected session, scroll down to read, and pinch to zoom.
- Desktops: scroll continuously, jump with the page selector, or turn pages with the left and right arrow keys.
- In **Full screen**, move the pointer to the top edge or tab to a control to reveal the toolbar. Press **Esc** or choose **Exit full screen** to return. Hold **Ctrl** and turn the mouse wheel over the artwork to zoom toward the pointer. Click and drag enlarged artwork to pan.
- `+` / `-` zoom from 50–300%; `0` or **Fit page** shows a whole page. **Fit width** uses all available width. Scroll to explore enlarged artwork. Browser zoom remains available.
- Local artwork, lazy loading, no external services or runtime dependencies.

## Run locally

Install Node.js 22 or newer, then run `npm run dev` and open http://127.0.0.1:4173.

## Build

Run `npm run build`. Upload the contents of `dist/` to any static host. All asset paths are relative, including for GitHub Pages project URLs.

## Artwork

Source: Google Drive → Iron Lung → comics. Session 1 starts with a pre-title page, then its cover and pages 00–09. Session 2 includes its title page and pages 00–17. The PNG files are full-resolution originals for readable zooming.

To add pages, copy `Iron-Lung-Page-NN.png` for Session 1 or `Iron-Lung-Session-02-Page-NN.png` for Session 2 into `public/comics/` and rebuild. The build reads image dimensions and orders each session numerically. Keep one file per page number when replacing artwork.

## GitHub Pages

The included workflow builds and deploys on pushes to `main`, or manually from Actions. In repository Settings → Pages, choose **GitHub Actions** as the source.
