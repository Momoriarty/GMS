import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Calendar, ChevronDown, Settings, User, HelpCircle, LogOut, Menu } from "lucide-react";

export default function Navbar({
    title = "Dashboard Overview",
    subtitle = "Selamat datang kembali, Admin Garuda",
    themeToggle,
    onMenuToggle,
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

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
            {(notifOpen || profileOpen) && (
                <div className="fixed inset-0 z-40" onClick={closeAll} />
            )}

            <header className="fixed top-0 left-0 lg:left-[220px] right-0 h-[68px] flex items-center justify-between px-4 md:px-7 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-content/5 text-base-content transition-all duration-300">

                {/* KIRI */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-base-200 text-base-content/70"
                    >
                        <Menu size={18} />
                    </button>

                    <div>
                        <h1 className="text-[15px] font-bold leading-tight text-base-content">{title}</h1>
                        <p className="text-[11px] mt-0.5 font-medium text-base-content/50 hidden sm:block">{subtitle}</p>
                    </div>
                </div>

                {/* KANAN */}
                <div className="flex items-center gap-2.5">

                    {/* THEME TOGGLE */}
                    <label className="toggle text-base-content border-none bg-white checked:bg-black [--tglbg:theme(colors.black)] checked:[--tglbg:theme(colors.white)] scale-90 md:scale-100 transition-all duration-200">
                        <input type="checkbox" value="unfriendlyghost" className="theme-controller" />
                        <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                            </g>
                        </svg>
                        <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 2v2"></path>
                                <path d="M12 20v2"></path>
                                <path d="m4.93 4.93 1.41 1.41"></path>
                                <path d="m17.66 17.66 1.41 1.41"></path>
                                <path d="M2 12h2"></path>
                                <path d="M20 12h2"></path>
                                <path d="m6.34 17.66-1.41 1.41"></path>
                                <path d="m19.07 4.93-1.41 1.41"></path>
                            </g>
                        </svg>
                    </label>

                    {/* TANGGAL */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 text-[12px] font-semibold rounded-xl bg-base-200 border border-base-content/5 text-base-content/70 transition-all duration-300">
                        <Calendar size={13} className="text-base-content/40" />
                        {formattedDate}
                    </div>

                    {/* NOTIFIKASI */}
                    <div className="relative z-50">
                        <button
                            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-base-200 hover:bg-base-300 border-none text-base-content/70"
                        >
                            <Bell size={16} strokeWidth={1.8} />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-base-100">
                                    {notifications.filter((n) => n.unread).length}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute top-14 right-0 w-[300px] md:w-[320px] rounded-2xl overflow-hidden mt-1 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-base-200 border border-base-content/10 transition-colors duration-300">
                                <div className="flex items-center justify-between px-4 py-3.5 border-b border-base-content/10">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[13px] text-base-content">Notifikasi</span>
                                        <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">3</span>
                                    </div>
                                    <button className="text-[11px] font-bold text-amber-500 hover:text-amber-600">
                                        Tandai semua dibaca
                                    </button>
                                </div>
                                <div className="px-4 py-6 text-center text-[12px] text-base-content/50">
                                    Tidak ada notifikasi terbaru.
                                </div>
                                <div className="px-4 py-3 bg-base-300/40 border-t border-base-content/5">
                                    <button className="w-full text-center text-[11px] font-bold text-base-content/50 hover:text-base-content/80">
                                        Lihat semua notifikasi →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PROFIL */}
                    <div className="relative z-50">
                        <button
                            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all bg-base-200 hover:bg-base-300 border-none text-base-content"
                        >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/10">
                                {user?.name ? user.name.split(" ").map((part) => part[0]).slice(0, 2).join("") : "AD"}
                            </div>
                            <div className="text-left hidden md:block leading-tight">
                                <p className="text-[12px] font-bold text-base-content">{user?.name || "Admin"}</p>
                                <p className="text-[10px] font-medium text-base-content/40">{user?.role || "Administrator"}</p>
                            </div>
                            <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 text-base-content/40 ${profileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute top-14 right-0 w-48 rounded-2xl overflow-hidden mt-1 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-base-200 border border-base-content/10 transition-colors duration-300">
                                <div className="px-4 py-3.5 flex items-center gap-2.5 border-b bg-amber-500/5 border-base-content/5">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0 bg-gradient-to-br from-amber-500 to-amber-600">
                                        {user?.name ? user.name.split(" ").map((part) => part[0]).slice(0, 2).join("") : "AD"}
                                    </div>
                                    <div className="leading-tight">
                                        <p className="font-bold text-[12px] text-base-content">{user?.name || "Admin"}</p>
                                        <p className="text-[10px] font-bold text-amber-500">{user?.role || "Super Admin"}</p>
                                    </div>
                                </div>

                                <div className="py-1">
                                    {profileMenuItems.map(({ label, icon: Icon }, i) => (
                                        <button
                                            key={i}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-semibold text-left transition-colors text-base-content/70 hover:bg-base-300/50 hover:text-base-content"
                                        >
                                            <Icon size={14} className="text-base-content/40" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                <div className="py-1 border-t border-base-content/5">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-left transition-colors text-red-500 hover:bg-red-500/10"
                                    >
                                        <LogOut size={14} />
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