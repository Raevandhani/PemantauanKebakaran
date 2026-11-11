# Hotspot Smart Reporter

Prototipe sistem informasi berbasis web untuk pelaporan dan pemantauan kebakaran di Palembang. Warga dapat melaporkan kejadian lengkap dengan foto dan lokasi GPS, lalu laporan tampil di peta pemantauan dan dapat ditindaklanjuti oleh petugas.

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
| Backend | [Supabase](https://supabase.com/) (Postgres) |
| Hosting | Situs statis, misalnya Vercel, Netlify, atau GitHub Pages |

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

Kelompok 2, mata kuliah Pemantauan dan Kota Cerdas. 
Dosen pengampu: Erick Dazki, S.Kom., M.Kom.

Anggota:
