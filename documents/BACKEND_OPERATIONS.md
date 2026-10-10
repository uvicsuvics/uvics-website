# Backend operations — issue #7

## Target, environment, dan migration

Gunakan `.env.example`. Tooling memuat `.env.local` melalui `@next/env` dan memeriksa URL cocok dengan `SUPABASE_PROJECT_REF`. Secret key (atau legacy service-role), DB password, dan Cloudinary secret hanya server/operator. Publishable key adalah key client. `APP_ORIGIN` harus origin persis tanpa trailing slash; HTTP hanya localhost, production HTTPS. Vercel memakai IP dari header Vercel tervalidasi; hosting lain memerlukan adapter eksplisit.

```sh
npm run db:migrate -- <project-ref-terverifikasi>
npm run db:types
npm run cloudinary:setup -- <cloud-name-terverifikasi>
npm run admin:provision
```

Runner migration memakai psql/TLS, transaksi, advisory lock, checksum, dan riwayat `supabase_migrations.schema_migrations`. Migration terapan tidak diedit; tambahkan migration lanjutan. Jangan menjalankan reset hosted atau baseline tool lain atas riwayat ini. `PSQL_BIN` boleh menunjuk binary lokal. Untuk generator pada jaringan IPv4, isi `SUPABASE_DB_POOLER_HOST` dari **session pooler resmi Dashboard Connect**. Password tidak masuk history shell/log. Migration/provisioning tidak berjalan saat build/request.

Verifikasi Dashboard/API Auth: signup OFF, anonymous OFF, email/password ON, single-session OFF, JWT expiry 3600, refresh rotation ON. SQL tidak mengubah Dashboard Auth. Selaraskan site URL/callback dengan origin saat rilis. SMTP/reset email tidak dibangun. Provisioning menerima identitas operator dan password tersembunyi, memakai Auth Admin API dengan email_confirm, lalu profil admin. Akun existing tidak direset/dipromosikan. Kegagalan profil menyebut UUID untuk rekonsiliasi; jangan membuat duplikat.

Untuk provisioning noninteraktif yang telah diotorisasi operator, simpan JSON lokal berisi `name`, `email`, dan `password` dalam `.runtime/`, kemudian jalankan `npm run admin:provision -- --from-file .runtime/<identity>.json --project <project-ref-terverifikasi>`. Nilai credential tidak menjadi argumen command atau log; konfirmasi target eksplisit wajib. File ini tidak masuk Git dan tidak boleh dipakai sebagai fixture tes rutin. Mode tanpa argumen tetap memakai prompt password tersembunyi.

Deadline satu jam berasal dari `auth.sessions.created_at`. Narrow reader memakai owner postgres karena schema Auth hosted tidak dapat didelegasikan oleh operator; fungsi arbitrary-ID tidak dapat dieksekusi client/service-role. Tidak ada mutasi struktur/data Auth. Cleanup counter pg_cron `uvics-rate-limit-cleanup` berjalan setiap 15 menit, batch 1000 expired rows. PostgreSQL vanilla mungkin tanpa pg_cron; jadwal hosted harus diperiksa terpisah.

Next dev dikonfigurasi `logging.serverFunctions=false`: default versi ini mencetak argumen Action termasuk password. Jangan mengaktifkan kembali pada form autentikasi.

## Media dan kegagalan lintas provider

Preset `uvics_image_2mb_v1`, `uvics_image_5mb_v1`, `uvics_pdf_10mb_v1`: signed, authenticated, overwrite=false, **access_control token-only**. Account mengabaikan preset max_file_size; pre-upload eval menolak ukuran/format aktual. Eval, ACL, format, preset, public ID, timestamp, overwrite ikut ditandatangani. Completion memverifikasi metadata provider lagi.

Authenticated saja belum cukup: respons upload menyertakan signed delivery URL. ACL token-only memblokir CDN original/derivative meski URL signed. Pembatasan tersedia pada account ini tanpa membeli premium token delivery; aplikasi tidak menerbitkan token CDN. Endpoint privat memeriksa admin/owner, mengambil `private_download_url` API berumur 60 detik **di server**, lalu stream no-store. URL API tidak diberikan ke browser. PDF memakai image resource dengan format aktual pdf. Lihat [Cloudinary access control](https://cloudinary.com/documentation/control_access_to_media).

`publishMedia` hanya internal, dengan callback izin konten/consent domain. Salinan deterministik dibuat dengan ACL tertutup, metadata/izin diperiksa lagi, akses dibuka, lalu publication+audit disimpan. Retry tidak membuat salinan ganda. Kegagalan berusaha menutup ACL kembali, menandai FAILED, dan mengembalikan 503. Jika kompensasi provider/DB gagal, log kode rekonsiliasi; operator memeriksa exact public ID dan kedua asset ID. Ini bukan transaksi atomik lintas provider. Pencabutan publikasi/consent setelahnya menjadi tanggung jawab workflow domain, termasuk menutup CDN.

PUBLISHING menolak publisher kedua (409). Jika proses terputus, operator memastikan tidak ada request aktif, memeriksa salinan/izin, menutup ACL bila perlu, lalu menandai FAILED melalui SQL terkontrol sebelum retry. Tidak ada endpoint generic untuk mengubah status. Jangan membebaskan slot sumber selama signature masih berlaku.

## Pengujian pra-go-live

```sh
npm run verify:auth -- <project-ref-terverifikasi>
```

Server uji memakai namespace `RATE_LIMIT_NAMESPACE=issue7_<run>`. Kemudian set `RUN_HOSTED_TESTS=1` dan jalankan `npm run test:e2e -- tests/e2e/auth.spec.ts tests/e2e/media.spec.ts`. Tes ini memutasi fixture hosted; jangan jalankan setelah data live masuk. CI hanya memakai unit dan DB disposable tanpa credential hosted. `test:db` menguji batas waktu dengan Auth tiruan lokal, tanpa mengubah clock/row hosted. Suite `tests/db/security.sql` (#31) membuktikan allow/deny CMS/settings, penutupan DML langsung, context audit, dan rollback audit; setiap migration security baru wajib lulus suite ini sebelum `db:types`.

Identitas fixture pada `.runtime/auth-fixtures.json`; credential terpisah di `.runtime/auth-credentials.json`. Keduanya ignored; jangan cetak/upload. Manifest media ditulis sebelum upload dan menyimpan ID/deadline cleanup. Publikasi sample dapat diuji dengan `node --conditions=react-server --import tsx scripts/verify-publication.mts <project-ref> <media-manifest>`.

HTTPS smoke memakai build produksi di belakang TLS localhost dan sertifikat uji, tanpa mengubah trust OS. `TEST_APP_URL=https://localhost:3000` menerima sertifikat lokal hanya pada alamat itu. Test mengubah hint expiry cookie fixture untuk memicu refresh nyata, lalu memeriksa ID sesi tetap, Secure/Lax/host-only, dan no-store. Next dev menimpa Cache-Control halaman menjadi no-cache/must-revalidate; bukti no-store halaman harus berasal dari production build.

## Cleanup terarah

```sh
node scripts/cleanup-media.mjs <project-ref> <cloud-name> .runtime/media-<run>.json
# --apply setelah memeriksa dry-run
# --release-fixture hanya untuk reference issue7_fixture dan owner fixture tercatat
```

Cleanup memeriksa owner/ID/waktu database, menolak referensi aktif, dan menahan slot sampai **issued_at + 65 menit**. Claim READY dikomit sebelum delete provider; RPC menolak reuse. Script menginventaris exact ID pada image/raw/video dan authenticated/upload, menyimpan asset ID, delete berdasarkan asset ID, memverifikasi 404, lalu menandai CLEANED. Retry melanjutkan READY; tidak delete global prefix/reset DB.

HELD berarti jalankan kembali setelah deadline manifest; tidak perlu blocking sleep satu jam. Sebelum go-live: inventaris manifest, bersihkan aset eligible, lalu row upload sintetis, profil admin sintetis, dan Auth user sintetis berdasarkan UUID melalui Admin API. Pertahankan audit kecuali ada persetujuan operator khusus, juga schema/policy/preset/admin/konten final. Nonaktifkan/ban fixture usai pengujian. Cleanup go-live, backup/pemulihan, region/biaya rilis tetap pekerjaan persiapan production.

Seed CMS dan konten (`scripts/seed-cms.sql`) menulis baris sintetis ber-ID tetap, termasuk konten `PUBLISHED` dan `featured`. Sebelum go-live, hapus baris berikut berdasarkan ID (prefiks `00000000-0000-4000-8000-000000000…`, slug berawalan `seed-`):

| Tabel | ID |
| --- | --- |
| `pages` | `…0901`, `…0902` |
| `programs` | `…0911`, `…0912` |
| `competitions` | `…0921`, `…0922` |
| `achievements` | `…0931`, `…0932` (anggota `…0941`–`…0943` ikut terhapus cascade) |
| `projects` | `…0951`, `…0952` (anggota `…0961`, `…0962` ikut terhapus cascade) |

## Recovery dan portability tambahan

Timeout respons finish bukan bukti rollback: adapter membaca ulang intent dan merekonsiliasi publication committed. Retry row PUBLIC memeriksa metadata/ACL provider; bila tertutup akibat kompensasi, izin diperiksa lagi dan ACL dipulihkan sebelum URL dikembalikan. Kegagalan rekonsiliasi tetap 503/log aman.

Checksum memakai LF kanonis; .gitattributes menjaga SQL LF di Windows/Linux tanpa mengubah checksum migration terapan.

Setelah tes selesai, jalankan `node scripts/retire-fixtures.mjs <project-ref>` untuk menonaktifkan profil dan ban tiga identitas sintetis yang telah dicocokkan UUID/email. Akun serta intent tetap dipertahankan untuk cleanup terarah. Script verify:auth menolak reuse run retired; arsipkan manifest/credential lama jika memulai run baru, jangan aktifkan kembali fixture lama.
