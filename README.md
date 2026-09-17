# Kasir App (React + Vite + Supabase)

Versi React dari aplikasi kasir. Menu dibuat sederhana: **Kasir, Transaksi, dan Kelola Produk** (khusus owner). Frontend pakai **React (Vite)**.

## Stack

| Bagian | Teknologi |
|---|---|
| Framework frontend | React 19 + Vite |
| Routing | react-router-dom |
| Backend / database / auth | Supabase (Postgres + Auth) |
| Styling | CSS murni (`src/index.css`), tanpa UI library |

## Struktur folder

```
src/
├── main.jsx                  -> entry point
├── App.jsx                    -> routing (react-router)
├── index.css                  -> semua styling
├── lib/
│   ├── supabaseClient.js      -> isi URL & anon key Supabase di sini
│   ├── uploadImage.js          -> upload foto produk ke Supabase Storage
│   └── format.js               -> helper format rupiah & tanggal
├── context/
│   ├── AuthContext.jsx         -> session + profile (role) + login/logout
│   └── ToastContext.jsx        -> notifikasi kecil di pojok bawah
├── components/
│   ├── ProtectedRoute.jsx      -> redirect ke /login kalau belum masuk, cek role
│   └── Layout.jsx               -> sidebar + shell aplikasi
└── pages/
    ├── Login.jsx
    ├── Kasir.jsx                -> POS: grid produk + keranjang + bayar
    ├── Transaksi.jsx            -> riwayat transaksi
    └── KelolaProduk.jsx         -> tambah/ubah/hapus produk + upload foto (owner only)

sql/schema.sql                 -> jalankan di Supabase SQL Editor
sql/storage.sql                -> jalankan setelah schema.sql, untuk setup upload foto produk
```

## Setup

1. **Buat project di Supabase** → https://supabase.com
2. Buka **SQL Editor**, jalankan seluruh isi `sql/schema.sql`. Ini membuat tabel `profiles`, `products`, `transactions`, `transaction_items` + RLS policy, dan 3 produk contoh.
3. Masih di **SQL Editor**, jalankan seluruh isi `sql/storage.sql`. Ini membuat bucket `product-images` untuk upload foto produk (lewat halaman Kelola Produk), beserta aturan aksesnya (semua orang bisa lihat, hanya owner yang bisa upload/hapus).
4. Buka **Authentication → Users → Add user**, buat 2 akun:
   - `kasir@toko.com`
   - `owner@toko.com`
5. Copy **UID** masing-masing, lalu jalankan di SQL Editor:
   ```sql
   insert into public.profiles (id, name, role) values
     ('UID-KASIR', 'Kasir Toko', 'kasir'),
     ('UID-OWNER', 'Owner Toko', 'owner');
   ```
6. Buka **Project Settings → API**, copy `Project URL` dan `anon public key`, isi ke `src/lib/supabaseClient.js`:
   ```js
   const SUPABASE_URL = "https://xxxx.supabase.co";
   const SUPABASE_ANON_KEY = "xxxxxxxxxxxxxxxx";
   ```
7. Install dependency & jalankan:
   ```bash
   npm install
   npm run dev
   ```
8. Buka `http://localhost:5173`, login pakai salah satu akun di atas.

## Build untuk deploy

```bash
npm run build
```
Hasilnya ada di folder `dist/` — tinggal drag & drop ke Netlify/Vercel/Cloudflare Pages, atau `npm run preview` untuk cek hasil build secara lokal.

## Kenapa struktur ini cocok dijelaskan sebagai "pakai framework"

- **Routing berbasis komponen** (`react-router-dom`) menggantikan tab manual — setiap halaman (`Kasir`, `Transaksi`, dst) adalah komponen React terpisah dengan route sendiri (`/kasir`, `/transaksi`, ...).
- **State & re-render dikelola React** (`useState`, `useEffect`, `useMemo`) — bukan manipulasi DOM manual seperti versi sebelumnya.
- **Context API** (`AuthContext`, `ToastContext`) dipakai untuk berbagi data (siapa yang login, role-nya apa) ke semua halaman tanpa prop-drilling — ini konsep khas framework yang bisa dijelaskan ke penguji.
- **Route guard** (`ProtectedRoute.jsx`) yang menolak akses ke `/rekap` kalau bukan `owner` adalah pola standar React untuk role-based access control.

## Supabase tetap sama

Karena Supabase diakses lewat `@supabase/supabase-js` (bukan REST manual), semua query (`supabase.from("transactions").select(...)`, `.insert(...)`, dll) persis sama seperti versi vanilla JS — cuma sekarang dipanggil dari dalam komponen React lewat `useEffect`/event handler.
