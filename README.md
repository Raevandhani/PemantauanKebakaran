# Hotspot Smart Reporter

Prototipe sistem informasi berbasis web untuk pelaporan dan pemantauan kebakaran lahan dan hutan (karhutla) di Palembang. Warga dapat melaporkan kejadian lengkap dengan foto dan lokasi GPS, lalu laporan tampil di peta pemantauan dan dapat ditindaklanjuti oleh petugas.

Project akhir mata kuliah Pemantauan dan Kota Cerdas, Kelompok 2. Prototipe ini mendukung tiga pilar kota cerdas: Smart Environment, Smart Living, dan Smart Governance.

## Fitur

- **Buat laporan:** pilih jenis kejadian, tulis deskripsi, unggah foto, dan ambil lokasi otomatis lewat GPS (atau klik peta jika GPS tidak tersedia).
- **Peta pemantauan:** semua laporan tampil sebagai penanda berwarna sesuai status (merah: baru, kuning: sedang ditangani, hijau: selesai), lengkap dengan ringkasan jumlah per status.
- **Petugas:** daftar laporan masuk dan pengubahan status penanganan, dilindungi PIN sederhana.
- **Dua mode penyimpanan:** mode demo (data di browser) dan mode database (Supabase) yang dipilih otomatis dari isi `config.js`.

## Teknologi

| Bagian | Yang dipakai |
| --- | --- |
| Antarmuka | HTML, CSS, dan JavaScript biasa (tanpa framework dan tanpa build) |
| Peta | [Leaflet](https://leafletjs.com/) dengan tile Esri |
| Backend (opsional) | [Supabase](https://supabase.com/) (Postgres) |
| Hosting | Situs statis, misalnya Vercel, Netlify, atau GitHub Pages |

## Menjalankan secara lokal

1. Unduh atau clone repo ini.
2. Buka `index.html` di browser. Perlu koneksi internet untuk memuat peta.

Aplikasi langsung berjalan dalam **mode demo** dengan tiga laporan contoh, dan data tersimpan di browser. Fitur GPS hanya bekerja di HTTPS atau `localhost`, jadi jika tombol lokasi gagal saat file dibuka langsung, pilih lokasi dengan mengklik peta atau coba setelah di-deploy.

## Menghubungkan Supabase

Agar laporan dibagikan ke semua pengguna:

1. Buat project gratis di [supabase.com](https://supabase.com/).
2. Buka **SQL Editor**, lalu jalankan isi `supabase.sql` untuk membuat tabel `reports` beserta aturan aksesnya.
3. Buka **Settings → API**, salin **Project URL** dan **anon public key** ke `config.js`:

   ```js
   const CONFIG = {
     SUPABASE_URL: "https://xxxx.supabase.co",
     SUPABASE_ANON_KEY: "kunci-anon-anda",
     ADMIN_PIN: "1234",
     CENTER: [-2.9761, 104.7754]
   };
   ```

4. Muat ulang halaman. Label di samping judul berubah dari "Mode demo" menjadi "Terhubung ke database".

Gunakan hanya **anon key**. Jangan pernah menaruh `service_role` key di repo atau di file front-end.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di [vercel.com](https://vercel.com/), pilih **Add New → Project**, lalu impor repo ini.
3. Biarkan pengaturan bawaan (tanpa framework, tanpa build command), lalu klik **Deploy**.

Setiap `git push` ke branch `main` akan otomatis memperbarui situs. Jika memakai Supabase gratis, buka dashboard-nya sebelum presentasi karena project yang lama tidak aktif bisa dijeda otomatis.

## Batasan prototipe

- Aturan akses database membuka baca, tambah, dan ubah untuk semua orang. Cukup untuk demo, tetapi harus diperketat sebelum dipakai sungguhan (misalnya dengan Supabase Auth untuk petugas).
- PIN petugas tersimpan di sisi browser sehingga bukan keamanan sungguhan.
- Foto diperkecil dan disimpan sebagai teks di tabel `reports`. Untuk skala lebih besar, gunakan Supabase Storage.
- Belum ada verifikasi laporan ganda, notifikasi, atau integrasi data titik panas satelit.

## Pengembangan lanjutan

- Login petugas dengan Supabase Auth.
- Penyaringan peta berdasarkan jenis kejadian dan status.
- Integrasi data titik panas (hotspot) dari satelit.
- Notifikasi ke instansi terkait saat laporan baru masuk.

## Tim

Kelompok 2, mata kuliah Pemantauan dan Kota Cerdas. Dosen pengampu: Erick Dazki, S.Kom., M.Kom.

Anggota:
