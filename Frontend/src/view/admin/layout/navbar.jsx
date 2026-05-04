import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, ChevronDown } from "lucide-react";

export default function Navbar({
    title = "Dashboard Overview",
    subtitle = "Selamat datang kembali, Admin Garuda",
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const notifications = [
        { text: "Pendaftaran baru dari Reza Firmansyah", time: "5 menit lalu", unread: true },
        { text: "Event Liga Garuda Futsal Cup dimulai besok", time: "1 jam lalu", unread: true },
        { text: "Laporan bulan Juni telah tersedia", time: "3 jam lalu", unread: false },
    ];

    const closeAll = () => {
        setNotifOpen(false);
        setProfileOpen(false);
    };

    return (
        <>
            {(notifOpen || profileOpen) && (
                <div className="fixed inset-0 z-40" onClick={closeAll} />
            )}

            <header className="fixed top-0 left-[220px] right-0 h-[70px] bg-white border-b border-slate-100 flex items-center justify-between px-7 z-50">
                {/* Left: Title */}
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
                    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Date Badge */}
                    <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-500 font-medium">
                        <Calendar size={13} className="text-slate-400" />
                        {formattedDate}
                    </div>

                    {/* Notification Bell */}
                    <div className="relative z-50">
                        <button
                            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                            className="relative w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors duration-150 cursor-pointer"
                        >
                            <Bell size={17} className="text-slate-500" strokeWidth={1.8} />
                            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                3
                            </span>
                        </button>

                        {notifOpen && (
                            <div className="absolute top-12 right-0 w-[300px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                                    <span className="font-bold text-sm text-slate-900">Notifikasi</span>
                                    <span className="text-xs text-blue-500 font-semibold cursor-pointer hover:text-blue-600">
                                        Tandai semua dibaca
                                    </span>
                                </div>
                                {notifications.map((n, i) => (
                                    <div
                                        key={i}
                                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${n.unread ? "bg-blue-50/60" : "bg-white"
                                            }`}
                                    >
                                        <p className={`text-[13px] text-slate-800 ${n.unread ? "font-semibold" : "font-normal"}`}>
                                            {n.text}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative z-50">
                        <button
                            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                            className="flex items-center gap-2 px-2 py-1.5 pr-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
                        >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                AG
                            </div>
                            <div className="text-left">
                                <p className="text-[13px] font-semibold text-slate-800 leading-tight">Admin Garuda</p>
                                <p className="text-[10px] text-slate-400">Super Admin</p>
                            </div>
                            <ChevronDown size={13} className="text-slate-400 ml-1" />
                        </button>

                        {profileOpen && (
                            <div className="absolute top-12 right-0 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                                {["Profil Saya", "Pengaturan", "Bantuan"].map((item, i) => (
                                    <button
                                        key={i}
                                        className="w-full px-4 py-2.5 text-left text-[13px] text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer"
                                    >
                                        {item}
                                    </button>
                                ))}
                                <div className="border-t border-slate-100">
                                    <button
                                        onClick={() => navigate("/")}
                                        className="w-full px-4 py-2.5 text-left text-[13px] text-red-500 font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                                    >
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