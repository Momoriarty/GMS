import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, ChevronDown, Settings, User, HelpCircle, LogOut } from "lucide-react";

export default function Navbar({
    title = "Dashboard Overview",
    subtitle = "Selamat datang kembali, Admin Garuda",
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const notifications = [];

    const profileMenuItems = [
        { label: "Profil Saya", icon: User },
        { label: "Pengaturan", icon: Settings },
        { label: "Bantuan", icon: HelpCircle },
    ];

    const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    // Warna dropdown abu-abu gelap disesuaikan dengan tema
    const dropdownStyle = {
        background: "#0f172a", // slate-900
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    };

    return (
        <>
            {(notifOpen || profileOpen) && (
                <div className="fixed inset-0 z-40" onClick={closeAll} />
            )}

            <header
                className="fixed top-0 left-[220px] right-0 h-[68px] flex items-center justify-between px-7 z-50"
                style={{
                    background: "rgba(15,23,42,0.95)", // Menggunakan dasar slate-900 dengan opacity
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {/* Left */}
                <div>
                    <h1 className="text-[15px] font-bold text-white leading-tight">{title}</h1>
                    <p className="text-[11px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>{subtitle}</p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2.5">

                    {/* Date */}
                    <div
                        className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium rounded-xl"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}
                    >
                        <Calendar size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
                        {formattedDate}
                    </div>

                    {/* Notification Bell */}
                    <div className="relative z-50">
                        <button
                            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <Bell size={16} style={{ color: "rgba(255,255,255,0.6)" }} strokeWidth={1.8} />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2" style={{ borderColor: "#0f172a" }}>
                                    {notifications.filter((n) => n.unread).length}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute top-14 right-0 w-[320px] rounded-2xl overflow-hidden mt-1" style={dropdownStyle}>
                                <div
                                    className="flex items-center justify-between px-4 py-3.5"
                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[13px] text-white">Notifikasi</span>
                                        <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">3</span>
                                    </div>
                                    <button className="text-[11px] font-semibold" style={{ color: "#fbbf24" }}>
                                        Tandai semua dibaca
                                    </button>
                                </div>

                                {notifications.length > 0 ? (
                                    notifications.map((n, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                                            style={{
                                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                background: n.unread ? "rgba(251,191,36,0.04)" : "transparent",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                                            onMouseLeave={e => e.currentTarget.style.background = n.unread ? "rgba(251,191,36,0.04)" : "transparent"}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                                                style={{ background: n.unread ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)" }}
                                            >
                                                {n.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[12px] leading-snug ${n.unread ? "font-semibold text-white" : "font-normal"}`} style={!n.unread ? { color: "rgba(255,255,255,0.5)" } : {}}>
                                                    {n.text}
                                                </p>
                                                <p className="text-[10px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>{n.time}</p>
                                            </div>
                                            {n.unread && <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: "#fbbf24" }} />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-4 text-[12px] text-slate-400" style={{ color: "rgba(255,255,255,0.55)" }}>
                                        Tidak ada notifikasi terbaru.
                                    </div>
                                )}

                                <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                                    <button className="w-full text-center text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        Lihat semua notifikasi →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative z-50">
                        <button
                            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">
                                AD
                            </div>
                            <div className="text-left">
                                <p className="text-[12px] font-bold text-white leading-none">Admin</p>
                                <p className="text-[10px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Administrator</p>
                            </div>
                            <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.4)" }} />
                        </button>

                        {profileOpen && (
                            <div className="absolute top-14 right-0 w-48 rounded-2xl overflow-hidden mt-1" style={dropdownStyle}>
                                {/* Profile header */}
                                <div className="px-4 py-3.5 flex items-center gap-2.5" style={{ background: "rgba(251,191,36,0.08)", borderBottom: "1px solid rgba(251,191,36,0.12)" }}>
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                                        AG
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-[13px] leading-none">Admin Garuda</p>
                                        <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#fbbf24" }}>Super Admin</p>
                                    </div>
                                </div>

                                <div className="py-1.5">
                                    {profileMenuItems.map(({ label, icon: Icon }, i) => (
                                        <button
                                            key={i}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium transition-colors text-left"
                                            style={{ color: "rgba(255,255,255,0.65)" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            <Icon size={14} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.4)" }} />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-1.5">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-left transition-colors"
                                        style={{ color: "#f87171" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <LogOut size={14} strokeWidth={1.8} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
