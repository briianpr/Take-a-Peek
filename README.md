# Take a peek. — Modern Calculator UI

Versi redesign kalkulator marketplace yang fokus pada usability dan hierarchy.

## Halaman
- `index.html` — landing page Take a peek.
- `calculator.html` — kalkulator Shopee Fee Intelligence versi modern

## Perbaikan UI/UX
- CSS kalkulator berdiri sendiri agar tidak bentrok dengan landing page
- 2-column workspace: input di kiri, summary sticky di kanan
- Ringkas / Lengkap untuk progressive disclosure
- Hitung Laba / Cari Harga Target
- Result-first hierarchy: laba, margin, dana masuk, BEP, target
- Fee wajib dan program opsional dipisahkan jelas
- Unit economics donut
- Simulasi harga ±10%
- Skenario tersimpan di browser
- Mobile responsive
- Print dan copy summary

## Jalankan lokal
```bash
python -m http.server 8000
```
Buka `http://localhost:8000/calculator.html`

## Deploy
Replace isi repository GitHub dengan isi folder/ZIP ini lalu commit ke branch production Cloudflare.
