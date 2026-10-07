# Take a peek. — Final Static Website

Versi gabungan:

- identitas **hitam-putih / grayscale**
- logo baru Take a peek.
- landing page
- mockup dashboard
- walkthrough otomatis seperti preview video:
  1. aktifkan extension
  2. intip data produk
  3. buka dashboard
  4. gunakan filter
  5. lihat komisi & kreator
  6. ekspor data
- tombol play / pause / restart
- pilihan step manual
- mode fullscreen demo
- siap GitHub Pages

## Struktur

```text
take-a-peek-final/
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

Buka:

- website: `http://localhost:8000`
- demo fullscreen: `http://localhost:8000/?demo=1`

## GitHub Pages

1. Buat repository GitHub.
2. Upload seluruh isi folder ke branch `main`.
3. Buka **Settings → Pages**.
4. Pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`.
6. Save.

Tidak membutuhkan npm, framework, atau build process.
