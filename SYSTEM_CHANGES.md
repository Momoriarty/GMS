# Dokumentasi Perubahan Sistem Generate Jadwal

## Ringkasan
Sistem generate jadwal telah diubah dari **backend-centric** menjadi **frontend-centric**. Sekarang jadwal dirandom di frontend terlebih dahulu, ditampilkan untuk review, baru kemudian dikirim ke backend untuk disimpan ke database.

## Alur Lama (Backend)
```
Frontend (form) 
  ↓ POST /generate-jadwal-random
Backend (generate + save pending)
  ↓
Frontend (preview)
  ↓ POST /confirm-jadwal
Backend (update pending → terjadwal)
```

## Alur Baru (Frontend)
```
Frontend (fetch event + pendaftaran)
  ↓
Frontend (generate jadwal lokal)
  ↓ preview jadwal
  ↓ user confirm
  ↓ POST /jadwal-pertandingan/bulk-save (array jadwal)
Backend (validasi + save)
  ↓
Database (simpan langsung dengan status terjadwal)
```

## Keuntungan Alur Baru

1. **Lebih Cepat** - Generate offline di frontend, tidak perlu round-trip ke backend
2. **User Control** - User bisa lihat preview dan generate ulang tanpa menyentuh database
3. **Lebih Reliable** - Backend hanya save data yang sudah validated di frontend
4. **Flexibility** - Algortima bisa diupdate di frontend tanpa deploy backend baru
5. **Offline Capable** - Bisa generate jadwal meski koneksi internet sedang lambat

## File yang Dibuat/Diubah

### Baru Dibuat

#### 1. `/Frontend/src/utils/scheduleGenerator.js`
Utility function untuk generate jadwal random di frontend dengan algoritma yang sama seperti backend.

**Exported Functions:**
- `generateSchedule(teams, event, minMatches)` - Main function
  - Input: Array tim, data event, minimum pertandingan per tim
  - Output: Object dengan `{success, message, data, total_matches, age_groups}`

**Internal Functions:**
- `generateMatches(teams, minMatches)` - Generate matches untuk satu kelompok umur
- `groupTeamsByAgeGroup(teams)` - Kelompokkan tim berdasarkan kelompok umur
- `generateMatchTime()` - Generate waktu pertandingan random
- `shuffleArray(array)` - Fisher-Yates shuffle

**Algoritma:**
1. Kelompokkan tim berdasarkan `kelompok_umur`
2. Untuk setiap kelompok umur:
   - Generate semua kombinasi pasangan unik
   - Shuffle untuk randomness
   - Phase 1: Ambil pasangan dimana kedua tim belum mencapai `minMatches`
   - Phase 2: Jika ada tim yang belum mencapai minimum, pairing dengan tim lain
3. Return array jadwal dengan waktu & lokasi sudah di-generate

### Diubah

#### 1. `/Frontend/src/view/admin/GenerateJadwalRandom.jsx`
Component untuk generate jadwal random.

**Perubahan Utama:**
- Import dari `scheduleGenerator` 
- `handleGenerate()`:
  - Fetch event (GET `/events/{id}`)
  - Fetch pendaftaran dengan status `diterima` (GET `/pendaftaran?event_id={id}&status=diterima`)
  - Extract tim dari `pendaftaran[].user.tim`
  - Generate jadwal menggunakan `generateSchedule()`
  - Show preview tanpa save ke backend
  
- `handleSave()`:
  - POST ke endpoint baru `/jadwal-pertandingan/bulk-save`
  - Body: `{ jadwal_list: [...] }`
  - Reload page setelah sukses

- `handleCancel()`:
  - Lokal only (no API call)

#### 2. `/Backend/app/Http/Controllers/Api/JadwalPertandinganController.php`
Tambahan method untuk handle bulk save.

**Method Baru:**
- `show(int $id)` - Get single jadwal (support preview)
- `bulkSave(Request $request)` - Receive array jadwal, validate, save

**bulkSave() Detail:**
- Validate array jadwal dengan rules:
  - `event_id` - must exist
  - `tim_1_id` dan `tim_2_id` - must exist dan berbeda
  - `waktu_pertandingan` - string (parsing otomatis)
  - `lokasi_lapangan` - required
  - `status` - in: terjadwal, berlangsung, selesai, pending
- Parse datetime dari format ISO 8601 atau standard
- Save ke database dengan status `terjadwal` (langsung live, bukan pending)
- Return `{success, message, data}` dengan breakdown saved_count

#### 3. `/Backend/app/Http/Controllers/Api/PendaftaranController.php`
Include tim relationship pada response.

**Perubahan:**
- Update `index()` method query: `with(['user', 'event', 'verifiedBy', 'user.tim'])`
- Sekarang response include tim data

#### 4. `/Backend/routes/api.php`
Tambah route untuk bulk save.

```php
Route::post('/jadwal-pertandingan/bulk-save', [JadwalPertandinganController::class, 'bulkSave']);
```

## API Endpoint Baru

### POST `/jadwal-pertandingan/bulk-save`
Menerima array jadwal yang sudah di-generate dan simpan ke database.

**Request Body:**
```json
{
  "jadwal_list": [
    {
      "event_id": 1,
      "tim_1_id": 5,
      "tim_2_id": 12,
      "waktu_pertandingan": "2026-07-01T08:00:00.000Z",
      "lokasi_lapangan": "Lapangan Utama",
      "status": "terjadwal"
    },
    ...
  ]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Jadwal berhasil disimpan (15 dari 15 jadwal)",
  "data": {
    "saved_count": 15,
    "total_count": 15,
    "errors": []
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "data": []
}
```

## Testing

### Prerequisites
1. Ada Event dengan minimal 2 Tim
2. Pendaftaran tim dengan status `diterima` (bukan `accepted`)
3. Backend running: `http://127.0.0.1:8000`
4. Frontend running: `http://localhost:5174`

### Test Steps
1. Login sebagai admin
2. Pergi ke halaman Event
3. Klik Event untuk view jadwal
4. Di section "Generate Jadwal Pertandingan Random":
   - Set minimum pertandingan per tim (misal: 2x)
   - Klik "Generate Jadwal Random"
5. Verifikasi:
   - Jadwal tergenerate di frontend (no backend call visible)
   - Preview modal tampil
   - Data jadwal benar (no tim vs tim sama)
6. Klik "Simpan Jadwal":
   - Should POST to `/jadwal-pertandingan/bulk-save`
   - Success message tampil
   - Page reload
   - Jadwal tersimpan di database

### Notes
- Status pendaftaran yang benar: `diterima` bukan `accepted`
- Waktu pertandingan di-generate dalam format ISO 8601
- Setiap save membuat jadwal langsung dengan status `terjadwal`
- Tidak ada lagi status `pending` dalam alur ini

## Migrasi dari Sistem Lama

Jika ada jadwal `pending` dari sistem lama yang belum di-save:
1. Delete manual: `DELETE FROM jadwal_pertandingan WHERE status = 'pending'`
2. Atau biarkan dan generate ulang

## Future Improvements

1. **Undo Generate** - User bisa undo perubahan sebelum save
2. **Edit Before Save** - Allow edit jadwal sebelum save (waktu, lokasi)
3. **Batch Processing** - For events dengan ratusan matches
4. **Export Jadwal** - Export ke PDF/Excel sebelum save
5. **Schedule Optimization** - Minimize venue conflicts, travel time
