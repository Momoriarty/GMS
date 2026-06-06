import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Package,
} from "lucide-react";

function NavItem({ item }) {
  return (
    <NavLink
      to={item.href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group"
      style={({ isActive }) =>
        isActive
          ? {
              background: "rgba(245,158,11,0.15)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.2)",
            }
          : {
              color: "rgba(255,255,255,0.65)",
              border: "1px solid transparent",
            }
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
            style={{
              color: isActive ? "#f59e0b" : "rgba(255,255,255,0.5)",
            }}
          />

          <span className="flex-1">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();

  const [menuUtama, setMenuUtama] = useState([]);
  const [menuSistem, setMenuSistem] = useState([]);

  useEffect(() => {
    setMenuUtama([
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
      },
      {
        label: "Pengguna",
        icon: Users,
        href: "/admin/pengguna",
      },
      {
        label: "Product",
        icon: Package,
        href: "/admin/product",
      },
    ]);

    setMenuSistem([
      {
        label: "Profil",
        icon: User,
        href: "/admin/profile",
      },
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

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
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm"
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
              style={{
                color: "rgba(245,158,11,0.5)",
              }}
            >
              Futsal & SSB
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
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

          <div className="flex flex-col gap-1">
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

          <div className="flex flex-col gap-1">
            {menuSistem.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div
        className="px-3 pb-5 pt-3"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
          style={{
            color: "rgba(248,113,113,0.8)",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.1)",
          }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}