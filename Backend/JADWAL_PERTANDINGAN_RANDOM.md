# Dokumentasi: Fitur Jadwal Pertandingan Random

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Perubahan Requirement](#perubahan-requirement)
3. [Arsitektur Sistem](#arsitektur-sistem)
4. [Cara Menggunakan](#cara-menggunakan)
5. [API Endpoints](#api-endpoints)
6. [Algoritma Generate Jadwal](#algoritma-generate-jadwal)

---

## Gambaran Umum

Fitur **Jadwal Pertandingan Random** memungkinkan admin untuk secara otomatis membuat jadwal pertandingan untuk sebuah event dengan kriteria:

- Satu event bisa memiliki tim dari berbagai kelompok umur (U-10, U-12, U-15, U-17, U-20, U-23)
- Sistem secara otomatis mendeteksi semua kelompok umur yang ada
- Untuk setiap kelompok umur, sistem membuat jadwal pertandingan acak
- Setiap tim bermain minimal jumlah pertandingan yang ditentukan (dalam kelompok umurnya)
- Tim hanya bertanding dengan tim dalam kelompok umur yang sama
- Tidak ada tim yang melawan dirinya sendiri
- **BARU**: Jadwal ditampilkan sebagai preview terlebih dahulu, kemudian admin bisa Save atau Cancel

---

## Perubahan Requirement

Dari requirement awal, ada 2 perubahan signifikan:

### 1. Multi-Kelompok Umur dalam Satu Event
- **Sebelumnya**: Admin pilih 1 kelompok umur per event
- **Sekarang**: 1 event bisa punya tim dari berbagai kelompok umur, sistem auto-detect

### 2. Preview Sebelum Save
- **Sebelumnya**: Generate langsung masuk ke database
- **Sekarang**: Generate → Preview Modal → Save/Cancel

**Alur Baru:**
```
1. Admin input Minimum Pertandingan (misal: 2x)
2. Klik "Generate Jadwal Random"
3. Sistem generate jadwal untuk SEMUA kelompok umur yang ada
4. Modal preview muncul dengan daftar jadwal
5. Admin review dan pilih:
   - SAVE: Jadwal masuk ke database (status: terjadwal)
   - CANCEL: Jadwal dihapus
```

---

## Arsitektur Sistem

### Backend (Laravel)

#### 1. **Service Layer** (`app/Services/JadwalPertandinganRandomService.php`)
Berisi logika bisnis untuk generate jadwal:

- `generateJadwal(Event $event, int $minPertandingan)` - Generate jadwal untuk semua kelompok umur
- `getTeamsForEvent(Event $event)` - Ambil tim yang terdaftar dan diterima
- `generateMatches(Collection $teams, int $minMatches)` - Generate kombinasi pertandingan
- `confirmSchedule(Event $event)` - Confirm jadwal pending menjadi terjadwal
- `cancelSchedule(Event $event)` - Hapus jadwal pending
- `getPendingSchedule(Event $event)` - Ambil jadwal pending untuk preview
- `generateMatchTime()` - Generate waktu pertandingan acak
- `clearSchedule(Event $event)` - Hapus jadwal terjadwal (untuk regenerate)

#### 2. **Controller** (`app/Http/Controllers/JadwalPertandinganRandomController.php`)
Menangani API requests:

- `generate(Request $request, $eventId)` - POST endpoint untuk generate jadwal (menghasilkan preview)
- `confirmSchedule($eventId)` - POST endpoint untuk save jadwal dari pending → terjadwal
- `cancelSchedule($eventId)` - POST endpoint untuk cancel jadwal pending
- `getSchedule($eventId)` - GET endpoint untuk ambil jadwal terjadwal
- `getPendingSchedule($eventId)` - GET endpoint untuk ambil jadwal pending (preview)
- `clearSchedule($eventId)` - DELETE endpoint untuk hapus jadwal terjadwal
- `getStats($eventId)` - GET endpoint untuk statistik jadwal

#### 3. **Models**
- **Event** - Menyimpan info event dengan kolom `min_pertandingan_per_tim`
- **Tim** - Menyimpan info tim dengan kolom `kelompok_umur` (sudah ada)
- **JadwalPertandingan** - Menyimpan jadwal pertandingan dengan status: terjadwal, pending, selesai, dibatalkan
- **Pendaftaran** - Menghubungkan tim dengan event

#### 4. **Status Jadwal**
- `pending` - Jadwal yang baru di-generate (dalam preview)
- `terjadwal` - Jadwal yang sudah di-save dan dikonfirmasi
- `selesai` - Jadwal yang sudah selesai pertandingannya
- `dibatalkan` - Jadwal yang dibatalkan

### Frontend (React)

#### 1. **Component: GenerateJadwalRandom.jsx**
UI untuk trigger generate jadwal dan preview:
- Input: Minimum pertandingan per tim
- Button: Generate Jadwal Random
- Modal Preview: Tampilkan daftar jadwal dengan button Save/Cancel

---

## Cara Menggunakan

### Untuk Admin

1. **Siapkan Event dan Tim**
   - Buat event
   - Daftarkan tim dengan berbagai kelompok umur (U-10, U-12, U-15, dll)
   - Verifikasi pendaftaran tim (status: diterima)

2. **Generate Jadwal**
   - Buka halaman jadwal pertandingan event
   - Lihat form "Generate Jadwal Pertandingan Random"
   - Input minimum pertandingan per tim (misal: 2x atau 3x)
   - Klik button "Generate Jadwal Random"

3. **Review Preview**
   - Modal preview akan muncul
   - Review daftar jadwal:
     - Tim A vs Tim B (kelompok umur sama)
     - Tanggal/waktu pertandingan
     - Lokasi
     - Jumlah total pertandingan
   - Lihat summary: Total pertandingan, kelompok umur, minimum pertandingan

4. **Simpan atau Batalkan**
   - **SAVE**: Jadwal masuk ke database, status berubah dari `pending` → `terjadwal`
   - **CANCEL**: Jadwal dihapus, tidak ada yang tersimpan

5. **Regenerate (Jika Diperlukan)**
   - Jika ingin ubah jadwal, hapus jadwal terjadwal terlebih dahulu
   - Generate ulang dengan parameter baru

---

## API Endpoints

### 1. Generate Jadwal Random (Preview)
```
POST /api/events/{eventId}/generate-jadwal-random
```

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "min_pertandingan": 2
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Jadwal pertandingan berhasil di-generate (belum disimpan)",
  "data": {
    "schedules": [
      {
        "id": 1,
        "event_id": 1,
        "tim_1_id": 5,
        "tim_1_nama": "Tim A",
        "tim_1_kelompok_umur": "U-12",
        "tim_2_id": 8,
        "tim_2_nama": "Tim B",
        "tim_2_kelompok_umur": "U-12",
        "waktu_pertandingan": "2026-07-05T10:00:00",
        "lokasi_lapangan": "Stadion A",
        "status": "pending"
      },
      ...
    ],
    "total_matches": 12,
    "age_groups": ["U-12", "U-15"],
    "min_pertandingan": 2
  }
}
```

**Response Error (422):**
```json
{
  "success": false,
  "message": "Minimal 2 tim dibutuhkan untuk membuat jadwal pertandingan"
}
```

---

### 2. Confirm/Save Jadwal
```
POST /api/events/{eventId}/confirm-jadwal
```

**Response:**
```json
{
  "success": true,
  "message": "Jadwal pertandingan berhasil disimpan (12 pertandingan)",
  "data": {
    "saved_count": 12
  }
}
```

---

### 3. Cancel Jadwal (Hapus Preview)
```
POST /api/events/{eventId}/cancel-jadwal
```

**Response:**
```json
{
  "success": true,
  "message": "Jadwal pertandingan dibatalkan"
}
```

---

### 4. Ambil Jadwal Terjadwal
```
GET /api/events/{eventId}/jadwal-pertandingan-random
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "event_name": "Turnamen 2026",
      "tim_1_id": 5,
      "tim_1_nama": "Tim A",
      "tim_1_kelompok_umur": "U-12",
      "tim_2_id": 8,
      "tim_2_nama": "Tim B",
      "tim_2_kelompok_umur": "U-12",
      "waktu_pertandingan": "2026-07-05T10:00:00",
      "lokasi_lapangan": "Stadion A",
      "status": "terjadwal"
    },
    ...
  ]
}
```

---

### 5. Ambil Jadwal Pending (Preview)
```
GET /api/events/{eventId}/jadwal-pending
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total_matches": 12
}
```

---

### 6. Hapus Jadwal Terjadwal
```
DELETE /api/events/{eventId}/jadwal-pertandingan-random
```

**Response:**
```json
{
  "success": true,
  "message": "Jadwal pertandingan berhasil dihapus (12 pertandingan)",
  "data": {
    "deleted_count": 12
  }
}
```

---

### 7. Statistik Jadwal
```
GET /api/events/{eventId}/jadwal-stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_matches": 12,
    "completed_matches": 0,
    "scheduled_matches": 12,
    "canceled_matches": 0,
    "pending_matches": 0
  }
}
```

---

## Algoritma Generate Jadwal

### Logika Per Kelompok Umur

1. **Grouping by Age Group**: Sistem membagi tim berdasarkan kelompok umur
2. **Skip jika < 2 tim**: Jika kelompok umur punya < 2 tim, skip
3. **Generate matches untuk setiap kelompok**

### Fase 1: Pasangan Optimal (Kedua Tim Belum Mencapai Minimum)

1. Generate semua kombinasi pasangan tim yang unik
2. Shuffle untuk randomness
3. Ambil pasangan di mana **kedua tim** belum mencapai jumlah pertandingan minimum
4. Increment counter untuk kedua tim

**Contoh:**
- Tim: A, B, C, D (kelompok U-12)
- Min pertandingan: 2x
- Pasangan optimal: (A-B), (C-D), (A-C), (B-D) → semua tim jadi 2x

### Fase 2: Pasangan Seimbang (Salah Satu Tim Belum Mencapai Minimum)

1. Dari pasangan yang belum digunakan
2. Ambil pasangan di mana **setidaknya satu tim** belum mencapai minimum
3. Increment counter

**Contoh:**
- Jika Tim A belum 2x, cari pasangan (A-X) dari tim lain
- Lanjutkan sampai semua tim minimal mencapai target

### Fase 3: Keseimbangan (Jika Perlu)

Jika ada tim yang masih belum mencapai minimum, tambah pertandingan ekstra (sesuai spesifikasi: diperbolehkan ada tim yang bermain lebih 1x dari minimum)

---

## Kelompok Umur yang Didukung

| Kode | Deskripsi | Usia Maksimal |
|------|-----------|---------------|
| U-10 | Kelompok Umur 10 | 10 tahun |
| U-12 | Kelompok Umur 12 | 12 tahun |
| U-15 | Kelompok Umur 15 | 15 tahun |
| U-17 | Kelompok Umur 17 | 17 tahun |
| U-20 | Kelompok Umur 20 | 20 tahun |
| U-23 | Kelompok Umur 23 | 23 tahun |

---

## Catatan Penting

1. **Validasi Pendaftaran**: Hanya tim dengan status pendaftaran "diterima" yang diikutkan
2. **Kelompok Umur**: Tim hanya bisa bertanding dengan tim dalam kelompok umur yang sama
3. **Minimum Pertandingan**: Per kelompok umur (bukan per event)
4. **Status Jadwal**:
   - `pending`: Dalam preview, belum disimpan
   - `terjadwal`: Sudah di-save dan dikonfirmasi
   - `selesai`: Pertandingan sudah dilaksanakan
   - `dibatalkan`: Pertandingan dibatalkan
5. **Preview Otomatis Dihapus**: Jika admin generate ulang, jadwal pending sebelumnya otomatis dihapus
6. **Waktu Pertandingan**: Otomatis di-generate antara jam 08:00 - 18:00 dalam range 2026-07-01 hingga 2026-07-10 (bisa disesuaikan)

---

## Migration & Database

### Kolom Event Baru
- `min_pertandingan_per_tim` (integer, default: 1)

### Tim (Sudah Ada)
- `kelompok_umur` (string)

### JadwalPertandingan Status
```
enum: ['terjadwal', 'pending', 'selesai', 'dibatalkan']
```

### Jalankan Migration
```bash
cd Backend
php artisan migrate
```

---

## Testing

### Generate dengan 2x minimum
```bash
curl -X POST http://localhost:8000/api/events/1/generate-jadwal-random \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"min_pertandingan": 2}'
```

### Confirm jadwal
```bash
curl -X POST http://localhost:8000/api/events/1/confirm-jadwal \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cancel jadwal
```bash
curl -X POST http://localhost:8000/api/events/1/cancel-jadwal \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Ambil jadwal yang sudah tersimpan
```bash
curl -X GET http://localhost:8000/api/events/1/jadwal-pertandingan-random \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Error: "Minimal 2 tim dibutuhkan"
- Pastikan event memiliki minimal 2 tim yang terdaftar
- Periksa status pendaftaran tim (harus "diterima")

### Preview tidak muncul
- Periksa console browser untuk error
- Pastikan response API success: true

### Jadwal tidak tersimpan setelah click Save
- Periksa response confirm-jadwal endpoint
- Lakukan refresh halaman jika tetap tidak muncul

### Jadwal pending masih ada
- Jadwal pending otomatis dihapus saat generate ulang
- Bisa manual hapus dengan cancel jadwal

---

## Development Notes

### File yang Dimodifikasi/Dibuat:

**Backend:**
- ✅ `app/Services/JadwalPertandinganRandomService.php` (BARU)
- ✅ `app/Http/Controllers/JadwalPertandinganRandomController.php` (BARU)
- ✅ `app/Models/Event.php` (MODIFIED - add min_pertandingan_per_tim)
- ✅ `app/Models/Tim.php` (MODIFIED - add kelompok_umur)
- ✅ `routes/api.php` (MODIFIED - add routes)
- ✅ `database/migrations/2026_06_20_000001_add_kelompok_umur_to_events_table.php` (BARU)

**Frontend:**
- ✅ `src/view/admin/GenerateJadwalRandom.jsx` (BARU)
- ✅ `src/view/admin/JadwalPertandingan.jsx` (MODIFIED - import component)

### Database Changes
- Event table: + `min_pertandingan_per_tim` column
- Tim table: + `kelompok_umur` column (sudah ada)
- JadwalPertandingan table: Status ada 4 value termasuk `pending`

---

**Version:** 2.0.0 (Update dengan Preview Modal)  
**Last Updated:** 2026-06-20

