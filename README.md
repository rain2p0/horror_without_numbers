# Rite of Spring

A minimal, static reader for the Iron Lung comic. Opens directly on the cover.

- Phones: open directly on the cover, scroll down to read, and pinch to zoom.
- Desktops: scroll continuously, jump with the page selector, or turn pages with the left and right arrow keys.
- In **Full screen**, move the pointer to the top edge or tab to a control to reveal the toolbar. Press **Esc** or choose **Exit full screen** to return. Hold **Ctrl** and turn the mouse wheel over the artwork to zoom toward the pointer. Click and drag enlarged artwork to pan.
- `+` / `-` zoom from 50–300%; `0` or Fit returns to the fitted page. Scroll to explore enlarged artwork. Browser zoom remains available.
- Local artwork, lazy loading, no external services or runtime dependencies.

## Run locally

Install Node.js 22 or newer, then run `npm run dev` and open http://127.0.0.1:4173.

## Build

Run `npm run build`. Upload the contents of `dist/` to any static host. All asset paths are relative, including for GitHub Pages project URLs.

## Artwork

Source: Google Drive → Iron Lung → comics. Includes the cover followed by pages 00–09, preserving the source numbering. The PNG files are full-resolution originals for readable zooming.

To add pages, copy `Iron-Lung-Page-NN.png` into `public/comics/` and rebuild. The build reads image dimensions and orders pages numerically. Replace an existing file to update its artwork.

## GitHub Pages

The included workflow builds and deploys on pushes to `main`, or manually from Actions. In repository Settings → Pages, choose **GitHub Actions** as the source.
