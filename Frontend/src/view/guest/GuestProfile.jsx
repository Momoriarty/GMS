import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  MapPin,
  CalendarCheck,
  AtSign,
  BadgeCheck,
  BadgeX,
  Phone,
  Sparkles,
  Edit2,
  Check,
  X,
  User
} from "lucide-react";

export default function Profile() {
  // State Utama untuk menyimpan data pengguna dari API
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Fitur Edit Profil
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    location: "",
    interest: ""
  });
  const [updating, setUpdating] = useState(false);

  // 1. Ambil Data Pengguna saat Komponen di-mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/user");
        const userData = res.data?.user || res.data?.data || res.data;

        setUser(userData);
        // Sinkronisasi data ke form editor internal
        setFormData({
          full_name: userData?.full_name || userData?.name || "",
          phone_number: userData?.phone_number || userData?.no_wa || userData?.phone || "",
          location: userData?.location || "",
          interest: userData?.interest || ""
        });
      } catch (err) {
        setError("Gagal memuat data profil. Pastikan Anda telah login.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // 2. Handler Perubahan Input Form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Simpan Perubahan ke API Backend
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await axios.put("http://localhost:8000/api/user/update", formData);
      const updatedData = res.data?.user || res.data?.data || { ...user, ...formData };
      setUser(updatedData);
      setIsEditing(false);
      alert("Profil berhasil diperbarui!");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b142d] text-white flex flex-col items-center justify-center gap-2">
        <span className="loading loading-spinner loading-md text-blue-500"></span>
        <p className="text-xs text-slate-400">Memuat data profil...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0b142d] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-sm text-red-400 border border-red-500/20 bg-red-500/10 px-4 py-2 rounded-xl">⚠️ {error}</div>
        <Link to="/login" className="btn btn-sm bg-blue-500 border-none text-white hover:bg-blue-600 rounded-full px-6">Masuk Sekarang</Link>
      </div>
    );
  }

  // Helper Formatter Tanggal
  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const displayName = user.full_name || user.name || "Pengguna";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const isEmailVerified = !!user.email_verified_at;

  // Deteksi nomor HP kosong atau strip untuk memberikan warning badge
  const isPhoneInvalid = !user.phone_number || user.phone_number.trim() === "" || user.phone_number.trim() === "-";

  return (
    <div className="min-h-screen bg-[#0b142d] text-white pb-16">

      {/* BACKGROUND HEADER */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937]" />

        {/* KARTU PROFIL UTAMA */}
        <div className="relative mx-auto max-w-4xl px-6 pt-16">
          <div className="rounded-3xl border border-white/5 bg-slate-950/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 sm:flex-row items-center sm:items-start text-center sm:text-left justify-between">

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {user.avatar ? (
                  <img src={user.avatar} alt={displayName} className="h-24 w-24 rounded-[28px] object-cover shadow-xl" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-500 to-orange-500 text-4xl font-extrabold text-slate-950 shadow-xl shrink-0">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.26em] text-blue-300/80">Akun Pengguna</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${isEmailVerified ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                      {isEmailVerified ? <BadgeCheck size={11} /> : <BadgeX size={11} />}
                      {isEmailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  <h1 className="mt-2 text-2xl font-bold text-white">{displayName}</h1>
                  <p className="text-xs text-slate-500">@{user.username || "username"}</p>

                  {isPhoneInvalid && (
                    <div className="mt-3 text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-xl animate-pulse inline-block">
                      ⚠️ Nomor WhatsApp wajib diisi agar bisa mendaftar turnamen/event!
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800 border border-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-slate-700"
                  >
                    <Edit2 size={13} /> Edit Profil
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500/20 border border-red-500/30 px-5 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30"
                  >
                    <X size={13} /> Batal
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FORMULIR / INFORMASI DETIL DATA */}
      <div className="mx-auto max-w-4xl px-6 mt-6">
        <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 md:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">
            {isEditing ? "Perbarui Informasi Kontak" : "Biodata Pengguna"}
          </h2>

          {!isEditing ? (
            /* MODE PREVIEW DATA */
            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-slate-950/60 p-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><User size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Nama Lengkap</p>
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/60 p-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><AtSign size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Username</p>
                  <p className="text-sm font-semibold text-white">@{user.username || "—"}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/60 p-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><Mail size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Alamat Email</p>
                  <p className="text-sm font-semibold text-white">{user.email || "—"}</p>
                </div>
              </div>

              <div className={`rounded-2xl p-4 flex items-center gap-3 border ${isPhoneInvalid ? "bg-orange-500/5 border-orange-500/20" : "bg-slate-950/60 border-transparent"}`}>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${isPhoneInvalid ? "bg-orange-500/20 text-orange-400" : "bg-orange-500/15 text-orange-300"}`}><Phone size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Nomor WhatsApp</p>
                  <p className={`text-sm font-bold ${isPhoneInvalid ? "text-orange-400 italic" : "text-white"}`}>
                    {isPhoneInvalid ? "Silakan isi nomor WhatsApp Anda" : user.phone_number}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/60 p-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300"><MapPin size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Domisili / Lokasi</p>
                  <p className="text-sm font-semibold text-white">{user.location || "—"}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/60 p-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"><CalendarCheck size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Tanggal Registrasi</p>
                  <p className="text-sm font-semibold text-white">{formatDate(user.created_at)}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/60 p-4 flex items-center gap-3 sm:col-span-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><Sparkles size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Minat Olahraga</p>
                  <p className="text-sm font-semibold text-white">{user.interest || "—"}</p>
                </div>
              </div>

            </div>
          ) : (
            /* MODE EDIT FORMULIR INPUT */
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">

                <div className="form-control w-full sm:col-span-2">
                  <label className="label text-xs text-slate-400 font-semibold uppercase">Nama Lengkap</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="input h-11 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label text-xs text-orange-400 font-semibold uppercase">No. WhatsApp / Telepon</label>
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    placeholder="Contoh: 08123456789"
                    value={formData.phone_number === "-" ? "" : formData.phone_number}
                    onChange={handleInputChange}
                    className="input h-11 bg-slate-950 border border-orange-500/40 rounded-xl text-white focus:outline-none focus:border-orange-500 text-sm font-bold"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label text-xs text-slate-400 font-semibold uppercase">Lokasi / Kota</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Contoh: Bandung"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input h-11 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="form-control w-full sm:col-span-2">
                  <label className="label text-xs text-slate-400 font-semibold uppercase">Minat Cabang Olahraga</label>
                  <input
                    type="text"
                    name="interest"
                    placeholder="Contoh: Futsal, Badminton"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="input h-11 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-sm h-10 px-5 rounded-xl border border-white/10 bg-transparent text-white hover:bg-white/5 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-sm h-10 px-6 rounded-xl border-none bg-blue-500 text-slate-950 hover:bg-blue-400 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  {updating ? "Menyimpan..." : <><Check size={14} /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}