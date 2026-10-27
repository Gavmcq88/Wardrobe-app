# Colour Wardrobe

Gavin's colour dictionary, outfits, wardrobe audit and shopping list as an installable phone app (PWA).
Works on iPhone and Android, opens full screen from the home screen, and works offline after the first visit.

## What's in it
- **Today**: an outfit for the occasion (office on weekdays, weekend at weekends, evening on Friday and Saturday nights, summer at summer weekends), least recently worn first. "I wore this today" keeps a wear log. "New idea" builds a fresh outfit from the clothes you are keeping, checked against the colour rules (one accent, moderate contrast, no black at the neck, a buffer under the camel coat, palette pairings), and you can save the ones you like.
- **Colours**: the 21 palette plates with Japanese names, pairings and the clothes you own in each colour; caution/avoid list; rules of thumb.
- **Outfits**: all 34 flat-lay outfits, filtered by occasion, with "worn N days ago".
- **Wardrobe**: all 147 items, searchable (by name, category or colour, e.g. "sage"), filtered by verdict. Tap an item for its colour check and the outfits that use it.
- **Shop**: sizes, budget bar, tick-off shopping list, the Zurich trip and the "can wait" list.

Ticks, the wear log and filters are stored on the phone only (localStorage).

## Files
- `index.html`, `styles.css`, `app.js`: the app
- `generator.js`: the rule-based outfit generator
- `illustrations.js`: flat-lay garment drawings, ported from the original colour-dictionary page
- `data/wardrobe-data.json`: all the content. Edit this to add clothes, outfits or shopping items
  (outfit `itemIds` and `watchId` refer to wardrobe `id`s)
- `sw.js`, `manifest.webmanifest`, `icons/`: what makes it installable and offline
- `tools/`: scripts used to build the data file, icons and the single-file preview

## Run locally
    python3 -m http.server 8000   # then open http://localhost:8000

## Host it (free)
Any static HTTPS host works. GitHub Pages: push this folder to a repo, then Settings → Pages → Deploy from branch → `main` / root.
Open the URL on the phone, then Share → Add to Home Screen (iPhone, Safari) or menu → Install app (Android, Chrome).
