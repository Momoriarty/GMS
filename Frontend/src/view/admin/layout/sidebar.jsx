import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  Bell,
  FileBarChart2,
  UserCog,
  LogOut,
  Zap,
} from "lucide-react";

const menuUtama = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Event", icon: CalendarDays, href: "/admin/event" },
  { label: "Peserta", icon: Users, href: "/admin/peserta" },
  {
    label: "Pendaftaran",
    icon: ClipboardList,
    href: "/admin/pendaftaran",
    badge: 15,
  },
];

const menuSistem = [
  { label: "Laporan", icon: FileBarChart2, href: "/admin/laporan" },
  { label: "Notifikasi", icon: Bell, href: "/admin/notifikasi", badge: 3 },
  { label: "Manajemen Admin", icon: UserCog, href: "/admin/users" },
];

function NavItem({ item }) {
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group`
      }
      style={({ isActive }) =>
        isActive
          ? {
              background: "rgba(245,158,11,0.15)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.2)",
            }
          : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
              style={{ background: "#f59e0b" }}
            />
          )}
          <item.icon
            size={16}
            strokeWidth={isActive ? 2.2 : 1.8}
            className="shrink-0 transition-all duration-200"
            style={{ color: isActive ? "#f59e0b" : "rgba(255,255,255,0.25)" }}
          />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span
              className="text-[10px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none"
              style={
                isActive
                  ? { background: "rgba(245,158,11,0.25)", color: "#f59e0b" }
                  : { background: "rgba(239,68,68,0.8)", color: "#fff" }
              }
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col z-50"
      style={{
        background: "#161b27",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
              color: "#0d1117",
            }}
          >
            GM
          </div>
          <div>
            <p className="text-white font-extrabold text-[14px] leading-tight">
              Garuda Melayu
            </p>
            <p
              className="text-[10px] font-bold tracking-[2px] uppercase mt-0.5"
              style={{ color: "rgba(245,158,11,0.5)" }}
            >
              Futsal & SSB
            </p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div
        className="mx-3 mt-4 mb-1 p-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
              }}
            >
              AG
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#10b981", borderColor: "#161b27" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-[12px] leading-none">
              Admin Garuda
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Zap size={9} style={{ color: "#f59e0b" }} className="shrink-0" />
              <p
                className="text-[10px] font-semibold"
                style={{ color: "rgba(245,158,11,0.7)" }}
              >
                Super Admin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 px-3 py-3 overflow-y-auto space-y-5"
        style={{ scrollbarWidth: "none" }}
      >
        <div>
          <p
            className="text-[9px] font-extrabold tracking-[2px] uppercase mb-2 px-2"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Menu Utama
          </p>
          <div className="flex flex-col gap-0.5">
            {menuUtama.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p
            className="text-[9px] font-extrabold tracking-[2px] uppercase mb-2 px-2"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Sistem
          </p>
          <div className="flex flex-col gap-0.5">
            {menuSistem.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div
        className="px-3 pb-5 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold active:scale-95 transition-all duration-200 group"
          style={{
            color: "rgba(248,113,113,0.7)",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.07)";
            e.currentTarget.style.color = "rgba(248,113,113,0.7)";
          }}
        >
          <LogOut size={15} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </aside>
  );
}
