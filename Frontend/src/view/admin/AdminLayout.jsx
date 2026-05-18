import { Outlet } from "react-router-dom";
import Sidebar from "./layout/navbar"; // Pastikan komponen ini menggunakan bg-slate-900 / gelap
import Navbar from "./layout/sidebar"; // Pastikan komponen ini menggunakan bg-slate-900 / gelap
import Footer from "./layout/footer";

export default function AdminLayout() {
  return (
    // Kita pastikan seluruh layar paling dasar berwarna abu-abu gelap pekat
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar tetap di kiri */}
      <Sidebar />

      {/* Bungkus area konten kanan agar background gelapnya merata dari atas sampai bawah */}
      <div className="flex-1 min-h-screen flex flex-col bg-slate-900 ml-[220px]">
        {/* Navbar sekarang berada di dalam struktur kanan */}
        <Navbar />

        {/* Konten Utama */}
        <main className="flex-1 p-6 mt-[68px] flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
