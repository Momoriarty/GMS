import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import axios from "axios";
import { AuthCard, InputField } from "./AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 2. Perbaikan: Tambahkan state untuk show/hide password dan loading
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Aktifkan status loading saat menembak API

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email: email,
        password: password,
      });

      // 1. Ambil token dari response Laravel
      const token = response.data.access_token;

      // 2. Simpan token ke dalam localStorage browser
      localStorage.setItem("token", token);

      // 3. Tendang user masuk ke halaman Admin Layout
      navigate("/admin");
    } catch (err) {
      // Menangkap pesan error dari validasi Laravel atau pesan kustom kita kemarin
      setError(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoading(false); // Matikan status loading setelah proses selesai
    }
  };

  return (
    <AuthCard>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-1">Selamat Datang</h1>
        <p className="text-slate-500 text-sm">
          Masuk ke akun admin Garuda Melayu
        </p>
      </div>

      {/* 3. Perbaikan: Tampilkan pesan error jika login gagal */}
      {error && (
        <div className="mb-4 p-3 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
          {error}
        </div>
      )}

      {/* 4. Perbaikan: Sebaiknya dibungkus form agar user bisa login hanya dengan menekan 'Enter' */}
      <form onSubmit={handleLogin}>
        <InputField
          icon={Mail}
          label="Email"
          type="email"
          placeholder="admin@garudamelayu.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputField
          icon={Lock}
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightElement={
            <button
              type="button" // Beri type="button" agar tidak memicu submit form secara tidak sengaja
              onClick={() => setShowPass(!showPass)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-amber-500 rounded"
            />
            <span className="text-slate-400 text-xs">Ingat saya</span>
          </label>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-amber-500 text-xs font-semibold hover:text-amber-400 transition-colors cursor-pointer"
          >
            Lupa password?
          </button>
        </div>

        <button
          type="submit" // Diubah menjadi submit agar singkron dengan onSubmit di tag <form>
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-600 text-xs">atau</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-amber-500 font-semibold hover:text-amber-400 transition-colors cursor-pointer"
        >
          Daftar sekarang
        </button>
      </p>
    </AuthCard>
  );
}
