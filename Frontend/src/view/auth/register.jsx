import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { AuthCard, InputField } from "./AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // navigate("/login");
    }, 1500);
  };

  return (
    <AuthCard>
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} />
        Kembali ke login
      </button>

      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">Buat Akun Baru</h1>
        <p className="text-slate-500 text-sm">Daftarkan diri sebagai admin Garuda Melayu</p>
      </div>

      <InputField icon={User} label="Nama Lengkap" placeholder="Ahmad Garuda" value={form.name} onChange={set("name")} />
      <InputField icon={Phone} label="No. WhatsApp" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={set("phone")} />
      <InputField icon={Mail} label="Email" type="email" placeholder="admin@garudamelayu.id" value={form.email} onChange={set("email")} />

      <InputField
        icon={Lock}
        label="Password"
        type={showPass ? "text" : "password"}
        placeholder="Min. 8 karakter"
        value={form.password}
        onChange={set("password")}
        rightElement={
          <button onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <InputField
        icon={Lock}
        label="Konfirmasi Password"
        type={showConfirm ? "text" : "password"}
        placeholder="Ulangi password"
        value={form.confirm}
        onChange={set("confirm")}
        rightElement={
          <button onClick={() => setShowConfirm(!showConfirm)} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      {/* Password strength */}
      {form.password && (
        <div className="mb-4 -mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  form.password.length >= i * 2
                    ? i <= 1 ? "bg-red-500" : i === 2 ? "bg-amber-500" : i === 3 ? "bg-blue-500" : "bg-green-500"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
          <p className="text-slate-600 text-[11px]">
            {form.password.length < 2 ? "Terlalu pendek" : form.password.length < 4 ? "Lemah" : form.password.length < 6 ? "Cukup" : "Kuat"}
          </p>
        </div>
      )}

      <div className="flex items-start gap-2 mb-6">
        <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 accent-amber-500 shrink-0" />
        <span className="text-slate-500 text-xs leading-relaxed">
          Saya setuju dengan{" "}
          <span className="text-amber-500 cursor-pointer hover:text-amber-400">Syarat & Ketentuan</span>
          {" "}dan{" "}
          <span className="text-amber-500 cursor-pointer hover:text-amber-400">Kebijakan Privasi</span>
        </span>
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60"
      >
        {loading ? "Mendaftarkan..." : "Buat Akun"}
      </button>

      <p className="text-center text-slate-500 text-sm mt-5">
        Sudah punya akun?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-amber-500 font-semibold hover:text-amber-400 transition-colors cursor-pointer"
        >
          Masuk
        </button>
      </p>
    </AuthCard>
  );
}