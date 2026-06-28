import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Axios Interceptor untuk otomatis menyisipkan Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token.replace("Bearer ", "")}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => n.unread || n.is_read === 0).length;

  // Konfigurasi Rute Menu Navigasi Tengah
  const navigationMenu = [
    { label: "Beranda", path: "/" },
    { label: "Event", path: "/events" },
    { label: "Jadwal", path: "/schedules" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Tentang", path: "/about" },
  ];

  const fetchData = async () => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");

    // JIKA TIDAK ADA TOKEN, LANGSUNG RESET USER DAN NOTIFIKASI
    if (!token) {
      setUser(null);
      setNotifications([]); // <--- Reset notifikasi di sini
      setLoadingUser(false);
      return;
    }

    try {
      // Hanya panggil API jika token dipastikan ada
      const [userRes, notifRes] = await Promise.all([
        axios.get("http://localhost:8000/api/user"),
        axios.get("http://localhost:8000/api/notifications").catch(() => null)
      ]);

      if (userRes) setUser(userRes.data?.user || userRes.data?.data || userRes.data);
      if (notifRes) setNotifications(notifRes.data?.notifications || notifRes.data?.data || notifRes.data || []);
    } catch (error) {
      setUser(null);
      setNotifications([]); // <--- Reset juga jika token kedaluwarsa / error 401
    } finally {
      loadingUser && setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("storage", fetchData);
    window.addEventListener("authChange", fetchData);
    window.addEventListener("focus", fetchData);

    return () => {
      window.removeEventListener("storage", fetchData);
      window.removeEventListener("authChange", fetchData);
      window.removeEventListener("focus", fetchData);
    };
  }, []);

  const handleLogout = async () => {
    try { await axios.post("http://localhost:8000/api/logout", {}); } catch (err) { }
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    setUser(null);
    setNotifications([]);
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#07090f]/70 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-20">

      {/* LEFT: LOGO */}
      <div
        onClick={() => navigate("/")}
        className="text-[26px] font-bold tracking-widest text-white cursor-pointer select-none font-['Bebas_Neue',_sans-serif]"
      >
        FUN<span className="text-[#ff4800]">FUTSAL</span>
      </div>

      {/* CENTER: NAVIGATION MENU */}
      <div className="hidden md:flex items-center gap-7">
        {navigationMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <a
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`text-[13px] font-semibold tracking-wide no-underline cursor-pointer transition-colors duration-200 ${isActive ? "text-white font-bold" : "text-white/60 hover:text-white"
                }`}
            >
              {item.label}
            </a> // <--- Di sini tadinya terditulis </td>, sekarang sudah benar menjadi </a>
          );
        })}
      </div>

      {/* RIGHT: CONTROLS (NOTIFIKASI & LOGIN/AVATAR) */}
      <div className="flex items-center gap-4">

        {/* DIKONDISIKAN: HANYA MUNCUL JIKA USER SUDAH LOGIN */}
        {!loadingUser && user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle bg-white/5 border border-white/10 hover:bg-white/15 hover:border-[#ff4800]/50 transition-all duration-200">
              <div className="indicator text-xl text-white">
                🔔
                {unreadCount > 0 && (
                  <span className="badge badge-xs indicator-item bg-[#ff4800] border-[#07090f] text-white font-bold p-1">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            <div tabIndex={0} className="card card-compact dropdown-content z-[1] mt-3 w-80 bg-[#111827] border border-white/10 shadow-2xl rounded-xl overflow-hidden">
              <div className="card-body p-0">
                <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                  <span className="font-bold text-sm text-white">Notifikasi Terbaru</span>
                  {unreadCount > 0 && <span className="text-xs text-[#ff4800] font-semibold">{unreadCount} Baru</span>}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id || n._id}
                        className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/[0.03] transition-colors ${(n.unread || n.is_read === 0) ? 'bg-[#ff4800]/[0.02]' : ''}`}
                      >
                        <div className="flex gap-2 items-start">
                          {(n.unread || n.is_read === 0) && <div className="w-1.5 h-1.5 bg-[#ff4800] rounded-full mt-1.5 flex-shrink-0" />}
                          <div>
                            <p className="text-white/80 text-xs leading-relaxed">{n.text || n.message}</p>
                            <span className="text-[10px] text-white/40 block mt-1">{n.time || n.created_at}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-white/40 text-xs">Tidak ada notifikasi</div>
                  )}
                </div>

                <button
                  onClick={() => navigate("/admin/notifications")}
                  className="btn btn-ghost btn-sm w-full rounded-none border-t border-white/5 text-[#ff4800] hover:bg-white/[0.02] normal-case font-semibold text-xs py-2"
                >
                  Lihat Semua Notifikasi →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONDITION: AVATAR DROPDOWN OR LOGIN BUTTON */}
        {!loadingUser && user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar bg-white/5 border border-white/15 text-[#ff4800] font-bold text-lg hover:border-[#ff4800] hover:shadow-[0_0_10px_rgba(255,72,0,0.2)] transition-all duration-200">
              <div className="w-10 rounded-full flex items-center justify-center">
                <span>👤</span>
              </div>
            </div>

            <ul tabIndex={0} className="menu menu-sm dropdown-content z-[1] mt-3 p-1 shadow-2xl bg-[#111827] border border-white/10 rounded-xl w-44 overflow-hidden">
              <div className="px-3 py-2 border-b border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                {user?.name || "User"}
              </div>
              <li>
                <a onClick={() => navigate("/admin/profile")} className="text-white py-2.5 px-3 hover:bg-white/[0.05] active:bg-white/[0.08]">
                  👤 Profile Admin
                </a>
              </li>
              <li>
                <a onClick={handleLogout} className="text-red-400 py-2.5 px-3 hover:bg-red-500/10 active:bg-red-500/20 border-t border-white/5 rounded-t-none">
                  🚪 Logout
                </a>
              </li>
            </ul>
          </div>
        ) : (
          !loadingUser && (
            <button
              onClick={() => navigate("/login")}
              className="btn btn-sm min-h-[40px] h-[40px] bg-[#ff4800] hover:bg-[#e03e00] text-white border-none font-bold text-xs px-6 rounded-lg tracking-wider transition-all duration-200 shadow-md"
            >
              LOGIN
            </button>
          )
        )}

      </div>
    </nav>
  );
};

export default Navbar;