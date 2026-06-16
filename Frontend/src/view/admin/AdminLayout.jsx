import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./layout/sidebar";
import Navbar from "./layout/navbar";
import Footer from "./layout/footer";

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

      <div className="flex-1 min-h-screen flex flex-col lg:ml-[220px]">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6 mt-[68px] flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}