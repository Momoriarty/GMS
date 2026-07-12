# Garuda Melayu Futsal (GMS) - Sistem Manajemen

Proyek ini terdiri dari beberapa komponen: Backend (Laravel), Frontend (React/Vite), WhatsApp Gateway (Node.js), dan Ngrok (untuk webhook Midtrans/QRIS).

## Instalasi / Setup Pertama Kali

Jika kamu baru pertama kali menjalankan proyek ini, atau baru melakukan *pull* dari Git, pastikan kamu telah menginstal hal-hal berikut di terminal:

### 1. Setup Backend (Laravel)
Pastikan XAMPP atau Laragon (MySQL) sudah berjalan. Buka terminal:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```
*(Jangan lupa untuk menyesuaikan kredensial database di dalam file `.env` jika diperlukan)*

### 2. Setup Frontend (React)
Buka terminal baru:
```bash
cd frontend
npm install
```
*(Pastikan file `.env` di frontend sudah diatur sesuai URL backend, misal: `VITE_API_URL=http://localhost:8000/api`)*

### 3. Setup WhatsApp Gateway
Buka terminal baru:
```bash
cd backend/whatsapp-gateway
npm install
```

---

## Cara Menjalankan Proyek (Local Development)

Untuk menjalankan proyek ini secara penuh di komputer lokal, buka **4 terminal terpisah** dan jalankan perintah berikut di masing-masing terminal:

### 1. Jalankan Backend (Laravel)
Buka terminal baru, masuk ke folder `backend`, lalu jalankan server PHP:
```bash
cd backend
php artisan serve
```
*(Backend akan berjalan di `http://localhost:8000`)*

### 2. Jalankan Frontend (React)
Buka terminal baru, masuk ke folder `frontend`, lalu jalankan server Vite:
```bash
cd frontend
npm run dev
```
*(Frontend biasanya berjalan di `http://localhost:5173` atau `3000`)*

### 3. Jalankan WhatsApp Gateway (Node.js)
Buka terminal baru, masuk ke folder `backend/whatsapp-gateway`, lalu jalankan bot WhatsApp:
```bash
cd backend/whatsapp-gateway
npm start
```
*(Jika sesi WhatsApp terputus, hapus folder `auth_info_baileys` di dalam folder whatsapp-gateway, lalu scan ulang QR Code)*

### 4. Jalankan Ngrok (Tunnelling untuk Webhook)
Agar sistem bisa menerima notifikasi otomatis (webhook) pembayaran dari luar (seperti GoPay), jalankan ngrok untuk mem-bypass localhost:
```bash
ngrok http 8000
```
*(Pastikan URL Ngrok yang dihasilkan sudah di-update di dashboard platform pembayaran)*

---

**Catatan**: Pastikan database (MySQL) via XAMPP atau Laragon sudah berjalan sebelum menjalankan `php artisan serve`.
