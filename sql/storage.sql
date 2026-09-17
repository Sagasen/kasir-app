-- ============================================================
-- STORAGE UNTUK FOTO PRODUK
-- Jalankan file ini di Supabase SQL Editor (setelah schema.sql)
-- ============================================================

-- 1. Buat bucket "product-images" (public = bisa diakses lewat URL langsung)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Siapa saja boleh melihat/mengunduh gambar (perlu, karena dipakai di halaman Kasir)
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- 3. Hanya owner yang boleh upload foto baru
create policy "product_images_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

-- 4. Hanya owner yang boleh mengganti foto
create policy "product_images_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

-- 5. Hanya owner yang boleh menghapus foto
create policy "product_images_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );
