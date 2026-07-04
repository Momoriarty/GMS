import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Trophy,
  Calendar,
  CheckCircle,
  ClipboardList,
  BarChart3,
  Bell,
  FileText,
  Wallet,
} from "lucide-react";

function NavItem({ item }) {

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group border ${isActive
          ? "bg-warning/10 text-warning border-warning/20"
          : "text-base-content/70 border-transparent hover:bg-base-200 hover:text-base-content"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-warning" />
          )}

          <item.icon
            size={16}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={isActive ? "text-warning" : "text-base-content/40 group-hover:text-base-content"}
          />

          <span className="flex-1">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [menuUtama, setMenuUtama] = useState([]);
  const [menuSistem, setMenuSistem] = useState([]);

  useEffect(() => {
    setMenuUtama([
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
      { label: "Event", icon: Trophy, href: "/admin/events" },
      { label: "Pendaftaran", icon: ClipboardList, href: "/admin/pendaftaran" },
      { label: "Laporan", icon: Wallet, href: "/admin/keuangan" },
      { label: "Notifikasi", icon: Bell, href: "/admin/notifikasi" },
      { label: "Pengguna", icon: Users, href: "/admin/pengguna" },
    ]);

    setMenuSistem([
      { label: "Audit Log", icon: FileText, href: "/admin/audit-log" },
      { label: "Profil", icon: User, href: "/admin/profile" },
    ]);
  }, []);

  const handleLogout = async () => {
  const token = localStorage.getItem("token");

  try {
    await axios.post(
      "http://localhost:8000/api/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  } catch (err) {
    // Silently handle error
  }

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  navigate("/login");
};

  return (
    <aside className={`
      fixed left-0 top-0 bottom-0 w-55 flex flex-col z-50
      bg-base-300 border-r border-base-content/5 text-base-content
      transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
    `}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 lg:hidden text-base-content/50 hover:text-base-content"
      >
        ✕
      </button>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-base-content/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm bg-linear-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/20 text-neutral-content">
            GM
          </div>

          <div>
            <p className="font-extrabold text-[14px] leading-tight text-base-content">
              Garuda Melayu
            </p>
            <p className="text-[10px] font-bold tracking-[2px] uppercase mt-0.5 text-warning/70">
              Futsal
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-5 scrollbar-none">
        <div>
          <p className="text-[9px] font-extrabold tracking-[2px] uppercase mb-2 px-2 text-base-content/30">
            Menu Utama
          </p>
          <div className="flex flex-col gap-1">
            {menuUtama.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-extrabold tracking-[2px] uppercase mb-2 px-2 text-base-content/30">
            Sistem
          </p>
          <div className="flex flex-col gap-1">
            {menuSistem.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-base-content/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-error bg-error/10 border border-error/20 hover:bg-error/20 transition-all duration-200"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}