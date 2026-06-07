import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Calendar, ChevronDown, Settings, User, HelpCircle, LogOut } from "lucide-react";

export default function Navbar({
    title = "Dashboard Overview",
    subtitle = "Selamat datang kembali, Admin Garuda",
    themeToggle,   // ← Prop untuk toggle tema (bisa tetap ada jika sisa aplikasi butuh)
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const notifications = []; // Bisa diisi dengan data notifikasi

    const profileMenuItems = [
        { label: "Profil Saya", icon: User },
        { label: "Pengaturan", icon: Settings },
        { label: "Bantuan", icon: HelpCircle },
    ];

    const closeAll = () => { setNotifOpen(false); setProfileOpen(false); };

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoadingUser(false);
                return;
            }

            try {
                const response = await axios.get("http://localhost:8000/api/user", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
            } catch (error) {
                console.error("Gagal memuat user:", error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <>
            {/* Overlay untuk menutup dropdown */}
            {(notifOpen || profileOpen) && (
                <div className="fixed inset-0 z-40" onClick={closeAll} />
            )}

            <header
                className="fixed top-0 left-[220px] right-0 h-[68px] flex items-center justify-between px-7 z-50 backdrop-blur-md transition-colors duration-300"
                style={{
                    background: "rgba(22, 27, 39, 0.95)", // Menggunakan #161b27 dengan sedikit transparansi untuk efek blur
                    borderBottom: "1px solid rgba(255,255,255,0.05)"
                }}
            >
                {/* Left Section */}
                <div>
                    <h1 className="text-[15px] font-bold leading-tight text-white">
                        {title}
                    </h1>
                    <p className="text-[11px] mt-0.5 font-medium text-white/50">
                        {subtitle}
                    </p>
                </div>

                {/* Bagian Tengah (Untuk toggle tema) */}
                {themeToggle}

                {/* Right Section */}
                <div className="flex items-center gap-2.5">

                    {/* Date */}
                    <div
                        className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium rounded-xl border transition-colors text-white/55"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                    >
                        <Calendar size={13} className="text-white/40" />
                        {formattedDate}
                    </div>

                    {/* Notification Bell */}
                    <div className="relative z-50">
                        <button
                            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all border text-white/60 hover:bg-white/10"
                            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                        >
                            <Bell size={16} strokeWidth={1.8} />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-[#161b27]">
                                    {notifications.filter((n) => n.unread).length}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {notifOpen && (
                            <div
                                className="absolute top-14 right-0 w-[320px] rounded-2xl overflow-hidden mt-1 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border"
                                style={{ background: "#161b27", borderColor: "rgba(255,255,255,0.1)" }}
                            >
                                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[13px] text-white">Notifikasi</span>
                                        <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">3</span>
                                    </div>
                                    <button className="text-[11px] font-semibold text-[#f59e0b] hover:text-amber-400">
                                        Tandai semua dibaca
                                    </button>
                                </div>

                                {notifications.length > 0 ? (
                                    notifications.map((n, i) => (
                                        <div key={i}
                                            className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-white/5 hover:bg-white/5
                                            ${n.unread ? "bg-[#f59e0b]/10" : "bg-transparent"}`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 
                                                ${n.unread ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "bg-white/10 text-white/60"}`}>
                                                {n.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[12px] leading-snug ${n.unread ? "font-semibold text-white" : "font-normal text-white/50"}`}>
                                                    {n.text}
                                                </p>
                                                <p className="text-[10px] mt-1 font-medium text-white/30">{n.time}</p>
                                            </div>
                                            {n.unread && <div className="w-2 h-2 rounded-full mt-1 shrink-0 bg-[#f59e0b]" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-4 text-[12px] text-white/55">
                                        Tidak ada notifikasi terbaru.
                                    </div>
                                )}

                                <div className="px-4 py-3 bg-white/5">
                                    <button className="w-full text-center text-[12px] font-semibold text-white/40 hover:text-white/70">
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
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all border hover:bg-white/10"
                            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                        >
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0d1117] text-[11px] font-extrabold shrink-0"
                                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                            >
                                {user?.name ? user.name.split(" ").map((part) => part[0]).slice(0, 2).join("") : "AD"}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-[12px] font-bold leading-none text-white">{user?.name || "Admin"}</p>
                                <p className="text-[10px] mt-0.5 font-medium text-white/40">{user?.role || "Administrator"}</p>
                            </div>
                            <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 text-white/40 ${profileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Profile Dropdown */}
                        {profileOpen && (
                            <div
                                className="absolute top-14 right-0 w-48 rounded-2xl overflow-hidden mt-1 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border"
                                style={{ background: "#161b27", borderColor: "rgba(255,255,255,0.1)" }}
                            >

                                {/* Profile header */}
                                <div className="px-4 py-3.5 flex items-center gap-2.5 border-b bg-[#f59e0b]/10 border-[#f59e0b]/10">
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0d1117] text-xs font-extrabold shrink-0"
                                        style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                                    >
                                        {user?.name ? user.name.split(" ").map((part) => part[0]).slice(0, 2).join("") : "AD"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[13px] leading-none text-white">{user?.name || "Admin"}</p>
                                        <p className="text-[10px] mt-0.5 font-medium text-[#f59e0b]">{user?.role || "Super Admin"}</p>
                                    </div>
                                </div>

                                <div className="py-1.5">
                                    {profileMenuItems.map(({ label, icon: Icon }, i) => (
                                        <button
                                            key={i}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-left transition-colors text-white/65 hover:bg-white/5 hover:text-white"
                                        >
                                            <Icon size={14} strokeWidth={1.8} className="text-white/40" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <div className="py-1.5 border-t border-white/10">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-left transition-colors text-red-400 hover:bg-red-500/10"
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