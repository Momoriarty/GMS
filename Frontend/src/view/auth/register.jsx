import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { AuthCard, InputField } from "./AuthLayout";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Tambahan: Untuk menampung pesan error

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setError("");

    // Validasi Frontend: Cek apakah password cocok
    if (form.password !== form.confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      // Menembak ke API Register Laravel
      // Kolom 'phone_number' disesuaikan dengan kolom migration database kemarin
      const response = await axios.post("http://localhost:8000/api/register", {
        name: form.name,
        phone_number: form.phone, 
        email: form.email,
        password: form.password,
      });

      // Jika berhasil, arahkan ke halaman login dengan membawa pesan sukses (opsional)
      alert(response.data.message || "Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      // Jika error validasi dari Laravel (misal email sudah terdaftar)
      if (err.response?.status === 422) {
        // Ambil pesan error pertama dari object error validasi Laravel
        const validationErrors = err.response.data;
        const firstErrorKey = Object.keys(validationErrors)[0];
        setError(validationErrors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || "Terjadi kesalahan saat mendaftar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <button
        type="button"
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

      {/* Menampilkan Alert Error jika registrasi gagal */}
      {error && (
        <div className="mb-4 p-3 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
          {error}
        </div>
      )}

      {/* Dibungkus dengan form agar enter-to-submit bekerja */}
      <form onSubmit={handleRegister}>
        <InputField icon={User} label="Nama Lengkap" placeholder="Ahmad Garuda" value={form.name} onChange={set("name")} required />
        <InputField icon={Phone} label="No. WhatsApp" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={set("phone")} required />
        <InputField icon={Mail} label="Email" type="email" placeholder="admin@garudamelayu.id" value={form.email} onChange={set("email")} required />

        <InputField
          icon={Lock}
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="Min. 8 karakter"
          value={form.password}
          onChange={set("password")}
          required
          rightElement={
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
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
          required
          rightElement={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
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
          <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 accent-amber-500 shrink-0" />
          <span className="text-slate-500 text-xs leading-relaxed">
            Saya setuju dengan{" "}
            <span className="text-amber-500 cursor-pointer hover:text-amber-400">Syarat & Ketentuan</span>
            {" "}dan{" "}
            <span className="text-amber-500 cursor-pointer hover:text-amber-400">Kebijakan Privasi</span>
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Mendaftarkan..." : "Buat Akun"}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-5">
        Sudnya punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-amber-500 font-semibold hover:text-amber-400 transition-colors cursor-pointer"
        >
          Masuk
        </button>
      </p>
    </AuthCard>
  );
}