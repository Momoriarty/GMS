"use client";

import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    ClipboardList,
    Trophy,
    Bell,
    FileBarChart2,
    UserCog,
    LogOut,
    ChevronRight,
} from "lucide-react";

const menuUtama = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
];

const menuSistem = [
    { label: "Notifikasi", icon: Bell, href: "/admin/notifikasi", badge: 3 },
];

function NavItem({ item }) {
    return (
        <NavLink
            to={item.href}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                    ? "bg-amber-500 text-white font-semibold"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 font-medium"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <item.icon size={17} strokeWidth={1.8} className="shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                        <span
                            className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none ${isActive ? "bg-white text-amber-500" : "bg-red-500 text-white"
                                }`}
                        >
                            {item.badge}
                        </span>
                    )}
                    {isActive && <ChevronRight size={13} className="opacity-70 shrink-0" />}
                </>
            )}
        </NavLink>
    );
}

export default function Sidebar() {
    const navigate = useNavigate();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-slate-900 flex flex-col z-50">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-500 font-extrabold text-sm shrink-0">
                    GM
                </div>
                <div>
                    <p className="text-white font-bold text-[15px] leading-tight">Garuda Melayu</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 tracking-widest">FUTSAL & SSB</p>
                </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5">
                <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                        AG
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-slate-900" />
                </div>
                <div>
                    <p className="text-slate-200 font-semibold text-[13px]">Admin Garuda</p>
                    <p className="text-slate-500 text-[11px]">Super Admin</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
                <div>
                    <p className="text-slate-600 text-[10px] font-bold tracking-[1.2px] uppercase mb-2 px-1.5">
                        Menu Utama
                    </p>
                    <div className="flex flex-col gap-0.5">
                        {menuUtama.map((item) => (
                            <NavItem key={item.href} item={item} />
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-slate-600 text-[10px] font-bold tracking-[1.2px] uppercase mb-2 px-1.5">
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
            <div className="px-3 py-4 border-t border-white/5">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 font-medium bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 cursor-pointer"
                >
                    <LogOut size={16} strokeWidth={1.8} />
                    Logout
                </button>
            </div>
        </aside>
    );
}