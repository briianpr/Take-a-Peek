# Take a peek. — Glass Edition

Static website siap GitHub Pages / Cloudflare Workers Static Assets.

## Identitas visual

Palet berdasarkan referensi:
- Orange: `#FF6D29`
- Brown: `#453027`
- Ink: `#161316`
- Gray: `#BABABA`
- White: `#FFFFFF`

Gaya:
- glassmorphism / frosted glass
- warm orange ambient glow
- translucent navigation
- glass cards dan dashboard
- responsive desktop + mobile
- walkthrough demo otomatis tetap dipertahankan

## Struktur

```text
.
├── index.html
├── .nojekyll
├── README.md
└── assets/
    ├── style.css
    ├── app.js
    ├── logo.png
    └── favicon.png
```

## Jalankan lokal

```bash
python -m http.server 8000
```

Kemudian buka:

- Website: `http://localhost:8000`
- Demo fullscreen: `http://localhost:8000/?demo=1`

## Deploy melalui GitHub

Upload seluruh isi folder ini ke repository GitHub Anda.

Jika Cloudflare project sudah terhubung ke repository tersebut, commit ke branch production akan memicu deployment baru.

Tidak membutuhkan framework, npm, atau build step.
