import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import Footer from "./footer";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-base-300 text-base-content transition-colors duration-300">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Konten utama — min-w-0 wajib agar flex child tidak overflow sidebar */}
      <div className="flex-1 min-w-0 min-h-screen flex flex-col lg:ml-[220px]">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 min-w-0 p-4 md:p-6 mt-[68px] flex flex-col overflow-x-hidden">
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
