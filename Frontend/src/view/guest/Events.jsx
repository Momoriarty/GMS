import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const fmtDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace(".", ":");
};

const fmtCurrency = (amount) => {
  if (amount === undefined || amount === null || amount === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [namaTim, setNamaTim] = useState("");
  const [kelompokUmur, setKelompokUmur] = useState("");
  const [logoTim, setLogoTim] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const eventRes = await axios.get(`http://localhost:8000/api/events/${id}`);
        setEvent(eventRes.data?.data || eventRes.data);

        const userRes = await axios.get("http://localhost:8000/api/user").catch(() => null);
        if (userRes) {
          setCurrentUser(userRes.data?.user || userRes.data?.data || userRes.data);
        }
      } catch (err) {
        setError("Gagal memuat informasi event atau data autentikasi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggleForm = () => {
    if (!currentUser) {
      alert("Silakan login terlebih dahulu untuk melakukan pendaftaran!");
      navigate("/login");
      return;
    }

    const phoneNumber = currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number;
    if (!phoneNumber || phoneNumber.trim() === "" || phoneNumber.trim() === "-") {
      alert("Silakan isi nomor WhatsApp terlebih dahulu di halaman profil sebelum mendaftar!");
      navigate("/profile");
      return;
    }

    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setLogoTim(e.target.files[0]);
  };

  const handleSubmitPendaftaran = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("event_id", id);
      formDataToSend.append("nama_tim", namaTim);
      formDataToSend.append("kelompok_umur", kelompokUmur);
      if (logoTim) formDataToSend.append("logo_tim", logoTim);
      formDataToSend.append("email_pendaftar", currentUser?.email || "");
      formDataToSend.append("no_wa_pendaftar", currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number || "");

      const res = await axios.post(`http://localhost:8000/api/pendaftaran`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Parse manual karena ada PHP notice di depan JSON
      let responseData = res.data;
      if (typeof responseData === 'string') {
        const jsonStart = responseData.indexOf('{');
        responseData = JSON.parse(responseData.substring(jsonStart));
      }

      const snapToken = responseData?.snap_token;

      if (snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: function () {
            alert("Pembayaran berhasil!");
            setShowForm(false);
          },
          onPending: function () {
            alert("Menunggu pembayaran...");
            setShowForm(false);
          },
          onError: function () {
            alert("Pembayaran gagal, silakan coba lagi.");
          },
          onClose: function () {
            alert("Kamu menutup popup pembayaran sebelum menyelesaikan transaksi.");
          }
        });
      } else {
        alert("Gagal mendapatkan token pembayaran.");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Gagal melakukan registrasi, periksa kembali jaringan atau data Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f] text-white flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-md text-[#ff4800]"></span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#07090f] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-sm text-red-500">⚠️ {error || "Event tidak ditemukan"}</div>
        <button onClick={() => navigate("/")} className="btn btn-xs bg-white/10 text-white">Kembali</button>
      </div>
    );
  }

  const filled = event.pendaftaran_count ?? 0;
  const total = event.kuota_tim ?? 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const sisa = total - filled;
  const isClosed = event.status === "draft" || event.status === "selesai" || sisa <= 0;

  return (
    <div className="min-h-screen bg-[#07090f] text-white pb-20">

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="text-xs text-white/40 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-white transition">Beranda</Link>
          <span>/</span>
          <span className="text-[#ff4800]">Detail Event</span>
        </div>

        <div className="bg-[#111422] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="badge bg-[#ff4800]/10 text-[#ff4800] border-[#ff4800]/20 font-bold text-[10px] uppercase px-2.5 py-1 mb-2">
                Tournament Resmi
              </span>
              <h1 className="text-xl md:text-3xl font-black tracking-wide">{event.nama_event}</h1>
              <p className="text-xs text-white/50 mt-1">📍 {event.lokasi}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2 min-w-[150px]">
              <span className="text-[10px] text-white/40 block uppercase tracking-wider">Biaya Pendaftaran</span>
              <span className="text-lg font-black text-[#ff4800]">{fmtCurrency(event.biaya_pendaftaran)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-white/40 block mb-1">📅 Jadwal Pelaksanaan:</span>
                <p className="font-semibold text-white/90">{fmtDate(event.tanggal_mulai)} s/d {fmtDate(event.tanggal_selesai)}</p>
              </div>
              <div>
                <span className="text-white/40 block mb-1">📝 Regulasi Singkat:</span>
                <p className="text-white/60 leading-relaxed whitespace-pre-line">
                  {event.deskripsi || "Sistem kompetisi menggunakan format sistem gugur. Satu tim terdaftar diperbolehkan mendaftarkan maksimal 10 pemain (5 inti + 5 cadangan)."}
                </p>
              </div>
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 self-start">
              <div className="flex justify-between mb-1.5 text-white/60">
                <span>Kuota Terisi ({filled}/{total} Tim)</span>
                <span className="font-bold text-[#ff4800]">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#ff4800] transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className={`font-bold ${sisa <= 3 ? "text-error" : "text-success"}`}>
                {sisa > 0 ? `🔥 Tersisa ${sisa} slot lagi!` : "Kuota Penuh"}
              </span>
            </div>
          </div>

          {!showForm && (
            <div className="pt-2">
              <button
                disabled={isClosed}
                onClick={handleToggleForm}
                className={`btn btn-md w-full font-bold uppercase tracking-wider ${isClosed ? "btn-disabled bg-white/5 text-white/20" : "bg-[#ff4800] hover:bg-[#e03e00] text-white border-none shadow-md"
                  }`}
              >
                {isClosed ? "Pendaftaran Ditutup" : "Lanjutkan Pendaftaran ↓"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="max-w-4xl mx-auto px-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#111422] border border-[#ff4800]/20 rounded-2xl p-6 md:p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ff4800]" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-white tracking-wide">Formulir Registrasi Tim</h2>
                <p className="text-xs text-white/50">Lengkapi berkas pendaftaran dengan benar</p>
              </div>
              <button onClick={() => setShowForm(false)} className="btn btn-xs btn-ghost text-white/40">Batal</button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-4 flex flex-wrap gap-4 justify-between items-center text-xs">
              <div>
                <span className="text-white/40 block">Manajer (Akun):</span>
                <span className="font-bold text-white">{currentUser?.name || "User"}</span>
              </div>
              <div>
                <span className="text-white/40 block">No. WhatsApp Official:</span>
                <span className="font-semibold text-white/80">{currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number}</span>
              </div>
              <div>
                <span className="text-white/40 block">Email Konfirmasi:</span>
                <span className="font-semibold text-white/80">{currentUser?.email || "—"}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitPendaftaran} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="form-control w-full">
                  <label className="label py-1"><span className="label-text text-xs text-white/70 font-semibold">Nama Tim Futsal</span></label>
                  <input
                    type="text" required placeholder="Contoh: SFC Garuda"
                    value={namaTim} onChange={(e) => setNamaTim(e.target.value)}
                    className="input input-sm h-10 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:border-[#ff4800]"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label py-1"><span className="label-text text-xs text-white/70 font-semibold">Kelompok Umur Kategori</span></label>
                  <select
                    required value={kelompokUmur} onChange={(e) => setKelompokUmur(e.target.value)}
                    className="select select-sm h-10 bg-[#111422] border border-white/10 rounded-lg text-white text-xs focus:border-[#ff4800]"
                  >
                    <option value="" disabled>Pilih Kelompok Umur</option>
                    <option value="U-17">Umur Kelompok U-17 (Pelajar)</option>
                    <option value="U-20">Umur Kelompok U-20 (Mahasiswa)</option>
                    <option value="Umum">Kategori Umum / Open Tournament</option>
                  </select>
                </div>

                <div className="form-control w-full md:col-span-2">
                  <label className="label py-1"><span className="label-text text-xs text-white/70 font-semibold">Upload Logo Resmi Tim (.PNG/.JPG)</span></label>
                  <input
                    type="file" accept="image/*" required onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-sm bg-white/5 text-white/70 text-xs w-full border-white/10 rounded-lg"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-[11px] text-white/40 max-w-sm text-center md:text-left">
                  Sistem akan otomatis menggunakan identitas kontak akun Anda sebagai perwakilan pusat informasi tim.
                </p>
                <button
                  type="submit" disabled={submitting}
                  className="btn btn-sm min-h-[40px] bg-[#ff4800] hover:bg-[#e03e00] text-white border-none font-bold text-xs px-8 rounded-lg tracking-wider w-full md:w-auto shadow-md"
                >
                  {submitting ? "Menyusun Invoice..." : "Submit & Bayar Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}