import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Simpan token dan data user
        localStorage.setItem("token", token);
        if (user.role) {
          localStorage.setItem("role", user.role);
        }

        // Redirect sesuai role
        if (user.role === "admin" || user.role === "owner") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Gagal parsing user data dari Google Callback:", error);
        navigate("/login?error=google_login_failed");
      }
    } else {
      navigate("/login?error=google_login_failed");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-lg font-semibold animate-pulse text-slate-300">Menghubungkan Akun Google...</h2>
        <p className="text-xs text-slate-500">Mohon tunggu sebentar, kami sedang menyiapkan sesi masuk Anda.</p>
      </div>
    </div>
  );
}
