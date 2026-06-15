import { Outlet } from "react-router-dom";

// Pastikan path-nya sesuai dengan struktur folder Anda
import Sidebar from "./layout/sidebar";
import Navbar from "./layout/navbar";
import Footer from "./layout/footer";

export default function AdminLayout() {
  return (
    // KUNCI PERUBAHAN: Mengganti style="#0d1117" dan text-slate-100 dengan class semantik DaisyUI
    <div className="min-h-screen flex bg-base-300 text-base-content transition-colors duration-300">
      
      {/* Sidebar tetap di kiri */}
      <Sidebar />

      {/* Area konten kanan */}
      <div className="flex-1 min-h-screen flex flex-col ml-[220px]">

        {/* Navbar otomatis mengontrol dan membaca status tema */}
        <Navbar />

        {/* Konten Utama */}
        <main className="flex-1 p-6 mt-[68px] flex flex-col">
          <div className="flex-1">
            {/* Semua halaman (Event, Pengguna, Profil) akan masuk di sini */}
            <Outlet />
          </div>
        </main>

        {/* Footer adaptif */}
        <Footer />

      </div>
    </div>
  );
}