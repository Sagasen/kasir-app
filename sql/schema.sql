-- ============================================================
-- SKEMA DATABASE APLIKASI KASIR (Supabase / PostgreSQL)
-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES (menyimpan role setiap akun: kasir / owner)
-- id = sama dengan id di auth.users (dibuat manual lewat Dashboard > Authentication)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('kasir','owner')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Semua user yang sudah login boleh lihat nama akun lain (dipakai di halaman
-- Transaksi & Pengeluaran untuk menampilkan nama kasir/owner yang bersangkutan).
create policy "profiles_select_all_auth"
  on public.profiles for select
  using (auth.role() = 'authenticated');


-- 2. PRODUCTS (daftar produk yang dijual)
create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric not null,
  image_url text,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "products_select_all_auth"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "products_owner_manage"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'));


-- 3. TRANSACTIONS (header transaksi penjualan)
create table public.transactions (
  id bigint generated always as identity primary key,
  cashier_id uuid references public.profiles(id),
  total numeric not null,
  paid numeric not null,
  change numeric not null,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_all_auth"
  on public.transactions for select
  using (auth.role() = 'authenticated');

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = cashier_id);


-- 4. TRANSACTION_ITEMS (detail item per transaksi)
create table public.transaction_items (
  id bigint generated always as identity primary key,
  transaction_id bigint references public.transactions(id) on delete cascade,
  product_id bigint references public.products(id),
  product_name text not null,
  price numeric not null,
  qty int not null,
  subtotal numeric not null
);

alter table public.transaction_items enable row level security;

create policy "items_select_all_auth"
  on public.transaction_items for select
  using (auth.role() = 'authenticated');

create policy "items_insert_auth"
  on public.transaction_items for insert
  with check (auth.role() = 'authenticated');


-- ============================================================
-- CONTOH DATA PRODUK (opsional, sesuaikan dengan produkmu)
-- ============================================================
insert into public.products (name, price, image_url) values
  ('Sabun Cuci Baju', 38000, null),
  ('Sabun Cuci Piring', 40000, null),
  ('Softener Pakaian', 45000, null);

-- ============================================================
-- CARA MEMBUAT AKUN KASIR & OWNER
-- ============================================================
-- 1. Buka Supabase Dashboard > Authentication > Users > Add user
--    Buat 2 user, contoh:
--    - kasir@toko.com
--    - owner@toko.com
-- 2. Copy UID masing-masing user, lalu jalankan:
--
-- insert into public.profiles (id, name, role) values
--   ('UID-KASIR-DISINI', 'Kasir Toko', 'kasir'),
--   ('UID-OWNER-DISINI', 'Owner Toko', 'owner');
