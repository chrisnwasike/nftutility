# NFT Utility 1.0 landing page

A static page: HTML, one stylesheet, one small script, three fonts (Archivo, Geist Mono and Caveat), a few pictures. No build step, no framework, no CDN, no cookies, no analytics. It runs on GitHub Pages as is.

## Files

```
index.html        the page (icons are inlined in it)
terms.html        installation and service terms (from the sales document)
privacy.html      what the page does with your data: nothing
404.html          the not found page (GitHub Pages serves it by itself)
robots.txt  .nojekyll
assets/styles.css  site.js  favicon.svg
assets/fonts/Archivo-Variable.woff2  GeistMono-Variable.woff2  Caveat-Variable.woff2   Archivo, Geist Mono and Caveat, SIL Open Font License (Geist-OFL.txt)
assets/Phosphor-LICENSE.txt                           the icons are Phosphor, MIT
assets/img/       screenshots of the working product (demo data), the share picture, the app icon,
                  the portrait (chris.webp) and the four stickers (obj-*.webp)
```

## Put it online (GitHub Pages)

GitHub Pages does not publish folders that start with a dot, so publish the contents, not the folder:

1. Create a repository, for example `nft-utility`.
2. Copy everything inside `.landing/` (including `.nojekyll`) to the repository root, or to a `docs/` folder.
3. Settings, Pages, deploy from the branch, and choose `/ (root)` or `/docs`.

All paths are relative, so it also works under `https://you.github.io/nft-utility/`. Open `index.html` straight from disk to preview; the only message you will see in the console is the browser refusing to preload the font over `file://`, which does not happen on a web server.

## Things to set before you share it

* **The X link.** Every "Book a demo on X" button points to `https://x.com/chrisdbuilder` (taken from the LICENSE file). Search `x.com/chrisdbuilder` in `index.html` and replace it if your handle is different.
* **Your story.** `index.html` has a comment, `YOUR STORY`, inside the "My experience" section. Add one or two sentences about a frustration you personally lived through.
* **Customer proof.** The proof wall quotes players of Secrets of the World and says so. Replace it with customer quotes as installations go live.
* **Terms.** `terms.html` is the standard terms text from the sales document. Have it reviewed before you rely on it. The hosting renewal price and the delivery window are still undecided in that document.
* If you add a canonical address, add `<link rel="canonical">` and absolute `og:image` URLs once you know the domain (social networks need absolute image addresses).

## Refreshing the screenshots

`node tests/e2e/shoot.mjs .landing/assets/img/raw` (needs the product's dev site) retakes them. `node .marketing/tools/make-cards.mjs` remakes the share picture, the app icon and the social images and videos.

## Pictures

chris.webp (the portrait in the story section) and obj-coin.webp, obj-card.webp, obj-bag.webp, obj-ticket.webp (the stickers beside each system and around the final call) are plain files in assets/img/. Replace a file with another of the same name to change it.

## Scroll effects

One passive scroll listener marks the frame dirty and the work runs in requestAnimationFrame. The four systems slide sideways while the section is pinned only on screens at least 900 x 700 that do not ask for reduced motion; everywhere else they stack. Without JavaScript every section is simply visible.
