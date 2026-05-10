import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { AuthCard, InputField } from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // navigate("/admin/dashboard");
    }, 1500);
  };

  return (
    <AuthCard>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-1">Selamat Datang</h1>
        <p className="text-slate-500 text-sm">Masuk ke akun admin Garuda Melayu</p>
      </div>

      <InputField
        icon={Mail}
        label="Email"
        type="email"
        placeholder="admin@garudamelayu.id"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        icon={Lock}
        label="Password"
        type={showPass ? "text" : "password"}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        rightElement={
          <button
            onClick={() => setShowPass(!showPass)}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <div className="flex items-center justify-between mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 accent-amber-500 rounded" />
          <span className="text-slate-400 text-xs">Ingat saya</span>
        </label>
        <button
          onClick={() => navigate("/forgot-password")}
          className="text-amber-500 text-xs font-semibold hover:text-amber-400 transition-colors cursor-pointer"
        >
          Lupa password?
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-600 text-xs">atau</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <p className="text-center text-slate-500 text-sm mt-6">
        Belum punya akun?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-amber-500 font-semibold hover:text-amber-400 transition-colors cursor-pointer"
        >
          Daftar sekarang
        </button>
      </p>
    </AuthCard>
  );
}
