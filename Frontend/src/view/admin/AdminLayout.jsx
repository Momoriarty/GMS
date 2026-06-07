import { Outlet } from "react-router-dom";

// Pastikan path-nya sesuai dengan struktur folder Anda
import Sidebar from "./layout/sidebar";
import Navbar from "./layout/navbar";
import Footer from "./layout/footer";

export default function AdminLayout() {
  return (
    <div
      className="min-h-screen flex transition-colors duration-300 text-slate-100"
      style={{ background: "#0d1117" }} // Latar belakang utama sedikit lebih gelap dari sidebar
    >
      {/* Sidebar tetap di kiri */}
      <Sidebar />

      {/* Area konten kanan */}
      <div className="flex-1 min-h-screen flex flex-col ml-[220px]">

        {/* Navbar tanpa prop themeToggle karena sudah permanen gelap */}
        <Navbar />

        {/* Konten Utama */}
        <main className="flex-1 p-6 mt-[68px] flex flex-col">

          <div className="flex-1">
            <Outlet />
          </div>

        </main>

        <Footer />

      </div>
    </div>
  );
}