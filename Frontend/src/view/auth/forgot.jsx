import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Shield } from "lucide-react";
import { AuthCard, InputField } from "./AuthLayout";

export default function Forgot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPass, setShowPass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
    }, 1200);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  return (
    <AuthCard>
      <button
        onClick={() => (step === 1 ? navigate("/login") : setStep(step - 1))}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} />
        {step === 1 ? "Kembali ke login" : "Kembali"}
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                s < step
                  ? "bg-green-500 text-white"
                  : s === step
                  ? "bg-amber-500 text-slate-900"
                  : "bg-slate-800 text-slate-600"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
            {s < 3 && (
              <div className={`w-8 h-px transition-colors duration-300 ${s < step ? "bg-green-500" : "bg-slate-700"}`} />
            )}
          </div>
        ))}
        <span className="text-slate-500 text-xs ml-2">
          {step === 1 ? "Verifikasi Email" : step === 2 ? "Kode OTP" : "Password Baru"}
        </span>
      </div>

      {/* Step 1 — Email */}
      {step === 1 && (
        <>
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <Mail size={22} className="text-amber-500" strokeWidth={1.6} />
            </div>
            <h1 className="text-white text-xl font-bold mb-1">Lupa Password?</h1>
            <p className="text-slate-500 text-sm">Masukkan email akun kamu. Kami akan kirimkan kode verifikasi.</p>
          </div>
          <InputField
            icon={Mail}
            label="Email Terdaftar"
            type="email"
            placeholder="admin@garudamelayu.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleNext}
            disabled={loading || !email}
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Kode OTP"}
          </button>
        </>
      )}

      {/* Step 2 — OTP */}
      {step === 2 && (
        <>
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <Shield size={22} className="text-amber-500" strokeWidth={1.6} />
            </div>
            <h1 className="text-white text-xl font-bold mb-1">Masukkan Kode OTP</h1>
            <p className="text-slate-500 text-sm">
              Kode 6 digit telah dikirim ke{" "}
              <span className="text-slate-300 font-medium">{email || "email kamu"}</span>
            </p>
          </div>
          <div className="flex gap-2 justify-between mb-6">
            {otp.map((val, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !val && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
                }}
                className="w-12 h-14 text-center text-lg font-bold bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
              />
            ))}
          </div>
          <p className="text-center text-slate-500 text-xs mb-5">
            Tidak terima kode?{" "}
            <span className="text-amber-500 font-semibold cursor-pointer hover:text-amber-400">Kirim ulang (60s)</span>
          </p>
          <button
            onClick={handleNext}
            disabled={loading || otp.some((v) => !v)}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Verifikasi Kode"}
          </button>
        </>
      )}

      {/* Step 3 — New Password */}
      {step === 3 && (
        <>
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <Lock size={22} className="text-amber-500" strokeWidth={1.6} />
            </div>
            <h1 className="text-white text-xl font-bold mb-1">Password Baru</h1>
            <p className="text-slate-500 text-sm">Buat password baru yang kuat untuk akun kamu.</p>
          </div>
          <InputField
            icon={Lock}
            label="Password Baru"
            type={showPass ? "text" : "password"}
            placeholder="Min. 8 karakter"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            rightElement={
              <button onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <InputField
            icon={Lock}
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password baru"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          {confirmPass && newPass !== confirmPass && (
            <p className="text-red-400 text-xs -mt-2 mb-4">Password tidak cocok</p>
          )}
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                navigate("/login");
              }, 1200);
            }}
            disabled={loading || !newPass || newPass !== confirmPass}
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </>
      )}
    </AuthCard>
  );
}