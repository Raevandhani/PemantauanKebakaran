-- Jalankan di Supabase: SQL Editor > New query > Run
create table reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text, category text, description text,
  lat double precision, lng double precision,
  photo text, status text default 'baru'
);

alter table reports enable row level security;
create policy "baca" on reports for select using (true);
create policy "tambah" on reports for insert with check (true);
create policy "ubah" on reports for update using (true);
