import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../data/api";
import {
  Mail,
  CalendarCheck,
  AtSign,
  BadgeCheck,
  BadgeX,
  Phone,
  Edit2,
  Check,
  X,
  User
} from "lucide-react";

export default function GuestProfile() {
  // State Utama untuk menyimpan data pengguna dari API
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [payingId, setPayingId] = useState(null);

  // States untuk Fitur Pembayaran Ulang
  const [selectedReg, setSelectedReg] = useState(null); // Pendaftaran yang akan dibayar
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("menunggu");
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  const fmtCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
    const fetchUserGuestProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/user');
        const userData = res.data?.user || res.data?.data || res.data;

        setUser(userData);
        // Sinkronisasi data ke form editor internal
        setFormData({
          full_name: userData?.full_name || userData?.name || "",
          phone_number: userData?.phone_number || userData?.no_wa || userData?.phone || "",
          location: userData?.location || "",
          interest: userData?.interest || ""
        });
        // fetch pendaftaran history for current user
        try {
          const regRes = await api.get('/pendaftaran');
          setRegistrations(regRes.data?.data || regRes.data || []);
        } catch {
          // ignore
        }
      } catch {
        setError("Gagal memuat data profil. Pastikan Anda telah login.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserGuestProfile();
  }, []);

  // 2. Handler Perubahan Input Form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handlePayRegistration = (registration) => {
    setSelectedReg(registration);
    setPaymentMethod("qris");
    setPaymentData(null);
    setPaymentStatus("menunggu");
  };

  const handleProcessPayment = async () => {
    if (!selectedReg) return;
    try {
      setPayingId(selectedReg.id);
      const res = await api.post(`/pendaftaran/${selectedReg.id}/pay`, { payment_method: paymentMethod });
      const data = res.data?.data || res.data;

      setPaymentData(data?.payment_data || data);
      setPaymentStatus("menunggu");
      pollAttemptsRef.current = 0;
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses pembayaran. Cek koneksi Anda.');
    } finally {
      setPayingId(null);
    }
  };

  // Polling status pembayaran ulang pendaftaran
  useEffect(() => {
    if (!selectedReg?.id || !paymentData) return;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    const checkStatus = async () => {
      try {
        pollAttemptsRef.current += 1;
        const res = await api.get(`/pendaftaran/${selectedReg.id}`);
        const data = res.data?.data || res.data;
        const status = data?.status;

        if (status) {
          setPaymentStatus(status);
        }

        if (status && status !== 'menunggu') {
          if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
          // Refresh registrations list
          const regRes = await api.get('/pendaftaran');
          setRegistrations(regRes.data?.data || regRes.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    pollingRef.current = setInterval(() => {
      if (pollAttemptsRef.current >= 40) {
        clearInterval(pollingRef.current); pollingRef.current = null;
        return;
      }
      checkStatus();
    }, 8000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [selectedReg, paymentData]);

  // 3. Simpan Perubahan ke API Backend
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await api.put('/user/update', formData);
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

          {/* Riwayat Pendaftaran has been moved below as a separate card */}

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
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"><CalendarCheck size={16} /></span>
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Tanggal Registrasi</p>
                  <p className="text-sm font-semibold text-white">{formatDate(user.created_at)}</p>
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

      {/* TABEL RIWAYAT PENDAFTARAN MINIMALIS */}
      <div className="mx-auto max-w-4xl px-6 mt-6 pb-12">
        <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 md:p-8 shadow-xl">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            📋 Riwayat Pendaftaran
          </h3>
          {registrations.length === 0 ? (
            <p className="text-xs text-white/40 italic py-2">Belum ada riwayat pendaftaran.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase font-bold tracking-wider">
                    <th className="pb-3 pr-4 font-semibold text-[10px]">Event / Tim</th>
                    <th className="pb-3 px-4 font-semibold text-[10px] hidden md:table-cell">Tanggal Daftar</th>
                    <th className="pb-3 px-4 font-semibold text-[10px]">Status</th>
                    <th className="pb-3 pl-4 font-semibold text-[10px] text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registrations.map((r) => {
                    const statusColors =
                      r.status === 'diterima'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : r.status === 'ditolak'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                    return (
                      <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 pr-4">
                          <div className="font-bold text-white/90 text-[13px]">{r.event?.nama_event || '—'}</div>
                          <div className="text-white/40 text-[11px] mt-0.5">Tim: <span className="text-white/70 font-semibold">{r.tim?.nama_tim || '-'}</span></div>
                        </td>
                        <td className="py-4 px-4 text-white/50 hidden md:table-cell">
                          {r.tanggal_daftar ? new Date(r.tanggal_daftar).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          }) : '—'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${statusColors} uppercase tracking-wider`}>
                            {r.status === 'menunggu' && <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />}
                            {r.status === 'diterima' && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                            {r.status === 'ditolak' && <span className="w-1 h-1 rounded-full bg-red-400" />}
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {r.status === 'menunggu' ? (
                            <button
                              onClick={() => handlePayRegistration(r)}
                              disabled={payingId === r.id}
                              className="btn btn-xs min-h-[28px] h-[28px] bg-[#ff4800] hover:bg-[#e34f00] text-white border-none font-bold rounded-lg px-3 shadow-sm transition-all"
                            >
                              {payingId === r.id ? 'Memproses...' : 'Bayar'}
                            </button>
                          ) : (
                            <span className="text-white/30 italic text-[11px]">Tidak ada aksi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PEMBAYARAN */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">

            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-base">Pembayaran Event</h3>
              <button
                onClick={() => {
                  setSelectedReg(null);
                  setPaymentData(null);
                  setPaymentStatus("menunggu");
                }}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Konten A: Memilih Metode Pembayaran */}
            {!paymentData ? (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl text-xs space-y-1">
                  <p className="text-white/40 uppercase">Event</p>
                  <p className="font-bold text-white text-sm">{selectedReg.event?.nama_event}</p>
                  <p className="text-white/40 mt-2 uppercase">Biaya Pendaftaran</p>
                  <p className="font-black text-[#ff4800] text-base">{fmtCurrency(selectedReg.event?.biaya_pendaftaran)}</p>
                </div>

                <p className="text-xs font-semibold text-white/70">Pilih Metode Pembayaran:</p>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin]">
                  {/* QRIS */}
                  <button
                    onClick={() => setPaymentMethod("qris")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'qris' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">🔲 QRIS</p>
                      <p className="text-[10px] text-white/40">Gopay, OVO, Dana, LinkAja</p>
                    </div>
                    {paymentMethod === 'qris' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>

                  {/* Gopay */}
                  <button
                    onClick={() => setPaymentMethod("gopay")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'gopay' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">💚 GoPay</p>
                      <p className="text-[10px] text-white/40">Bayar instan via aplikasi Gojek</p>
                    </div>
                    {paymentMethod === 'gopay' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>

                  {/* ShopeePay */}
                  <button
                    onClick={() => setPaymentMethod("shopeepay")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'shopeepay' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">🧡 ShopeePay</p>
                      <p className="text-[10px] text-white/40">Bayar instan via aplikasi Shopee</p>
                    </div>
                    {paymentMethod === 'shopeepay' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>

                  {/* BCA */}
                  <button
                    onClick={() => setPaymentMethod("bank_transfer_bca")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'bank_transfer_bca' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">🔵 BCA Virtual Account</p>
                      <p className="text-[10px] text-white/40">Transfer melalui Virtual Account BCA</p>
                    </div>
                    {paymentMethod === 'bank_transfer_bca' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>

                  {/* BNI */}
                  <button
                    onClick={() => setPaymentMethod("bank_transfer_bni")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'bank_transfer_bni' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">🟠 BNI Virtual Account</p>
                      <p className="text-[10px] text-white/40">Transfer melalui Virtual Account BNI</p>
                    </div>
                    {paymentMethod === 'bank_transfer_bni' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>

                  {/* BRI */}
                  <button
                    onClick={() => setPaymentMethod("bank_transfer_bri")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'bank_transfer_bri' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">🔵 BRI Virtual Account</p>
                      <p className="text-[10px] text-white/40">Transfer melalui Virtual Account BRI</p>
                    </div>
                    {paymentMethod === 'bank_transfer_bri' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>

                  {/* Mandiri */}
                  <button
                    onClick={() => setPaymentMethod("bank_transfer_mandiri")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'bank_transfer_mandiri' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">🟡 Mandiri Virtual Account</p>
                      <p className="text-[10px] text-white/40">Transfer melalui Bill Payment Mandiri</p>
                    </div>
                    {paymentMethod === 'bank_transfer_mandiri' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>

                  {/* Permata */}
                  <button
                    onClick={() => setPaymentMethod("bank_transfer_permata")}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${paymentMethod === 'bank_transfer_permata' ? 'border-[#ff4800] bg-[#ff4800]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">🟢 Permata Virtual Account</p>
                      <p className="text-[10px] text-white/40">Transfer melalui Virtual Account Permata</p>
                    </div>
                    {paymentMethod === 'bank_transfer_permata' && <span className="text-xs text-[#ff4800]">✓ Selected</span>}
                  </button>
                </div>

                <button
                  onClick={handleProcessPayment}
                  disabled={payingId !== null}
                  className="w-full btn btn-sm min-h-[40px] h-[40px] bg-[#ff4800] hover:bg-[#e03e00] text-white border-none font-bold rounded-xl text-xs shadow-md"
                >
                  {payingId !== null ? "Memproses..." : "Lanjut Bayar →"}
                </button>
              </div>
            ) : (
              /* Konten B: Menampilkan Detail Pembayaran / Hasil Sukses */
              <div className="space-y-5 text-center">
                {paymentStatus === "diterima" ? (
                  <div className="space-y-4 py-2">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-3xl flex items-center justify-center rounded-full mx-auto animate-bounce">
                      ✓
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest">Transaksi Sukses</p>
                      <h4 className="text-lg font-black text-white">Pembayaran Berhasil!</h4>
                      <p className="text-xs text-white/50 max-w-xs mx-auto mt-2">
                        Pendaftaran tim <span className="text-white font-bold">{selectedReg.tim?.nama_tim}</span> untuk event <span className="text-white font-bold">{selectedReg.event?.nama_event}</span> telah lunas dan terverifikasi.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedReg(null);
                        setPaymentData(null);
                        setPaymentStatus("menunggu");
                      }}
                      className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 border-none text-white font-bold rounded-xl w-full text-xs"
                    >
                      Selesai
                    </button>
                  </div>
                ) : paymentStatus === "ditolak" ? (
                  <div className="space-y-4 py-2">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 font-black text-3xl flex items-center justify-center rounded-full mx-auto">
                      ✕
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-red-400 font-extrabold uppercase tracking-widest">Transaksi Gagal</p>
                      <h4 className="text-lg font-black text-white">Pembayaran Ditolak</h4>
                      <p className="text-xs text-white/50 max-w-xs mx-auto mt-2">
                        Pembayaran ditolak oleh sistem. Silakan coba kembali atau hubungi panitia.
                      </p>
                    </div>
                    <button
                      onClick={() => setPaymentData(null)}
                      className="btn btn-sm bg-red-500 hover:bg-red-600 border-none text-white font-bold rounded-xl w-full text-xs"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  /* Menampilkan Informasi VA / QRIS */
                  <div className="space-y-4">
                    {paymentData?.payment_error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs text-left max-w-xs mx-auto">
                        Detail Error: {paymentData.payment_error}
                      </div>
                    )}

                    {/* QRIS */}
                    {paymentMethod === "qris" && (
                      <div className="space-y-4">
                        <p className="text-[11px] text-white/40 uppercase tracking-widest">Scan QR di Bawah</p>
                        <div className="bg-white rounded-2xl p-4 inline-block mx-auto">
                          {(() => {
                            const qrUrl = paymentData?.qr_code_url || paymentData?.actions?.find((a) => a.name === "generate-qr-code")?.url;
                            return qrUrl ? (
                              <img src={qrUrl} alt="QRIS" className="w-48 h-48 object-contain" />
                            ) : (
                              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-500">QR tidak tersedia</div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Gopay / ShopeePay */}
                    {(paymentMethod === "gopay" || paymentMethod === "shopeepay") && (
                      <div className="space-y-4">
                        <p className="text-[11px] text-white/40 uppercase tracking-widest">Aplikasi {paymentMethod === "gopay" ? "GoPay" : "ShopeePay"}</p>
                        {paymentData.qr_code_url && (
                          <div className="bg-white rounded-2xl p-4 inline-block mx-auto">
                            <img src={paymentData.qr_code_url} alt="QR" className="w-48 h-48 object-contain" />
                          </div>
                        )}
                        {paymentData.deeplink_url && (
                          <a href={paymentData.deeplink_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm w-full bg-[#ff4800] hover:bg-[#e34f00] text-white border-none font-bold rounded-xl text-xs py-2">
                            Buka Aplikasi {paymentMethod === "gopay" ? "GoPay" : "ShopeePay"}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Bank Transfer (Virtual Account) */}
                    {paymentMethod.startsWith("bank_transfer") && (() => {
                      const isMandiri = paymentData.bill_key && paymentData.biller_code;
                      const vaNumber = isMandiri ? paymentData.bill_key : (paymentData.va_numbers?.[0]?.va_number || paymentData.permata_va_number || "—");
                      const bankName = isMandiri ? "MANDIRI" : (paymentData.va_numbers?.[0]?.bank?.toUpperCase() || (paymentMethod === "bank_transfer_permata" ? "PERMATA" : "BANK"));

                      return (
                        <div className="space-y-4">
                          <p className="text-[11px] uppercase tracking-widest text-[#ff4800] font-bold">Virtual Account {bankName}</p>
                          <div className="bg-white/5 border border-[#ff4800]/30 rounded-2xl p-4 text-center">
                            {isMandiri && (
                              <div className="mb-2">
                                <p className="text-[10px] text-white/40 uppercase tracking-wider">Kode Perusahaan (Biller)</p>
                                <p className="text-base font-bold text-white tracking-widest">{paymentData.biller_code}</p>
                              </div>
                            )}
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                              {isMandiri ? "Kode Bayar (Bill Key)" : "Nomor Virtual Account"}
                            </p>
                            <p className="text-2xl font-black text-white tracking-widest">{vaNumber}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(vaNumber);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="mt-2 btn btn-xs bg-[#ff4800]/15 border border-[#ff4800]/30 text-[#ff4800] hover:bg-[#ff4800]/25 rounded-full px-3"
                            >
                              {copied ? "✓ Tersalin" : "Salin"}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-[11px] text-yellow-300 text-left">
                      ⚠️ Lakukan pembayaran sesuai petunjuk. Sistem akan mendeteksi transaksi secara otomatis dalam 1-5 menit.
                    </div>

                    <button
                      onClick={() => {
                        setSelectedReg(null);
                        setPaymentData(null);
                        setPaymentStatus("menunggu");
                      }}
                      className="btn btn-xs bg-transparent border border-white/10 hover:bg-white/5 text-white/40 hover:text-white rounded-xl w-full py-1.5"
                    >
                      Tutup & Bayar Nanti
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
