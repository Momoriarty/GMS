import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../data/api";

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

// Komponen tampilan pembayaran setelah submit
function PaymentResult({ paymentData, paymentMethod, event, namaTim, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QRIS
  if (paymentMethod === "qris") {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 text-center space-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#ff4800] font-bold mb-1">Scan & Bayar</p>
          <h3 className="text-xl font-black text-white">QRIS Payment</h3>
          <p className="text-xs text-white/50 mt-1">Scan QR code di bawah dengan aplikasi apapun</p>
        </div>

        <div className="bg-white rounded-2xl p-4 inline-block mx-auto">
          {paymentData?.qr_code_url ? (
            <img src={paymentData.qr_code_url} alt="QRIS" className="w-52 h-52 object-contain mx-auto" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
              QR tidak tersedia
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-white/40">Event</span><span className="font-bold text-white">{event?.nama_event}</span></div>
          <div className="flex justify-between"><span className="text-white/40">Tim</span><span className="font-bold text-white">{namaTim}</span></div>
          <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
            <span className="text-white/40 font-bold">Total</span>
            <span className="font-black text-[#ff4800] text-sm">{fmtCurrency(event?.biaya_pendaftaran)}</span>
          </div>
        </div>

        <p className="text-[11px] text-white/40">Berlaku hingga: <span className="text-white/70">{paymentData?.expiry_time || "15 menit"}</span></p>

        <button onClick={onClose} className="btn btn-xs border border-white/10 bg-transparent text-white/50 hover:text-white rounded-full px-6">
          Tutup
        </button>
      </div>
    );
  }

  // GoPay / ShopeePay
  if (paymentMethod === "gopay" || paymentMethod === "shopeepay") {
    const label = paymentMethod === "gopay" ? "GoPay" : "ShopeePay";
    const deeplink = paymentData?.deeplink_url || paymentData?.actions?.find(a => a.name === "deeplink-redirect")?.url;
    const qrUrl = paymentData?.qr_code_url || paymentData?.actions?.find(a => a.name === "generate-qr-code")?.url;

    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 text-center space-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#ff4800] font-bold mb-1">Pembayaran</p>
          <h3 className="text-xl font-black text-white">{label}</h3>
        </div>

        {qrUrl && (
          <div className="bg-white rounded-2xl p-4 inline-block mx-auto">
            <img src={qrUrl} alt={label} className="w-52 h-52 object-contain mx-auto" />
          </div>
        )}

        {deeplink && (
          <a href={deeplink} target="_blank" rel="noopener noreferrer"
            className="btn w-full bg-[#ff4800] hover:bg-[#e03e00] text-white border-none font-bold rounded-xl">
            Buka Aplikasi {label}
          </a>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-white/40">Event</span><span className="font-bold text-white">{event?.nama_event}</span></div>
          <div className="flex justify-between"><span className="text-white/40">Tim</span><span className="font-bold text-white">{namaTim}</span></div>
          <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
            <span className="text-white/40 font-bold">Total</span>
            <span className="font-black text-[#ff4800] text-sm">{fmtCurrency(event?.biaya_pendaftaran)}</span>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-xs border border-white/10 bg-transparent text-white/50 hover:text-white rounded-full px-6">
          Tutup
        </button>
      </div>
    );
  }

  // Bank Transfer / Virtual Account
  if (paymentMethod === "bank_transfer") {
    const vaNumber = paymentData?.va_numbers?.[0]?.va_number || paymentData?.permata_va_number || "—";
    const bank = paymentData?.va_numbers?.[0]?.bank?.toUpperCase() || "BANK";

    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 space-y-5">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest text-[#ff4800] font-bold mb-1">Transfer Bank</p>
          <h3 className="text-xl font-black text-white">Virtual Account {bank}</h3>
          <p className="text-xs text-white/50 mt-1">Transfer ke nomor VA di bawah ini</p>
        </div>

        <div className="bg-white/5 border border-[#ff4800]/30 rounded-2xl p-5 text-center">
          <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2">Nomor Virtual Account</p>
          <p className="text-3xl font-black text-white tracking-widest">{vaNumber}</p>
          <button
            onClick={() => copyToClipboard(vaNumber)}
            className="mt-3 btn btn-xs bg-[#ff4800]/20 border border-[#ff4800]/30 text-[#ff4800] hover:bg-[#ff4800]/30 rounded-full px-4"
          >
            {copied ? "✓ Tersalin!" : "Salin Nomor"}
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-white/40">Event</span><span className="font-bold text-white">{event?.nama_event}</span></div>
          <div className="flex justify-between"><span className="text-white/40">Tim</span><span className="font-bold text-white">{namaTim}</span></div>
          <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
            <span className="text-white/40 font-bold">Total Transfer</span>
            <span className="font-black text-[#ff4800] text-sm">{fmtCurrency(event?.biaya_pendaftaran)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-300">
          ⚠️ Transfer tepat sesuai nominal. Pembayaran otomatis terverifikasi dalam 1-5 menit.
        </div>

        <p className="text-[11px] text-white/40 text-center">Berlaku hingga: <span className="text-white/70">{paymentData?.expiry_time || "24 jam"}</span></p>

        <button onClick={onClose} className="btn btn-xs border border-white/10 bg-transparent text-white/50 hover:text-white rounded-full px-6 w-full">
          Tutup
        </button>
      </div>
    );
  }

  return null;
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const paymentRef = useRef(null);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [namaTim, setNamaTim] = useState("");
  const [kelompokUmur, setKelompokUmur] = useState("");
  const [logoTim, setLogoTim] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState(null); // hasil dari backend Core API
  const [pendaftaranId, setPendaftaranId] = useState(null);
  const pollingRef = useRef(null);
  const [pollAttempts, setPollAttempts] = useState(0);

  const paymentGroups = [
    {
      title: "QRIS",
      subtitle: "Satu QR code untuk semua metode pembayaran",
      badge: "BEST PRICE",
      methods: [
        { value: "qris", label: "QRIS", description: "GoPay, OVO, Dana, semua bank", icon: "🔲" },
      ],
    },
    {
      title: "E-Wallet",
      subtitle: "Dompet digital populer",
      methods: [
        { value: "gopay", label: "GoPay", description: "Bayar lewat aplikasi Gojek", icon: "💚" },
        { value: "shopeepay", label: "ShopeePay", description: "Bayar lewat aplikasi Shopee", icon: "🧡" },
      ],
    },
    {
      title: "Transfer Bank",
      subtitle: "Virtual Account semua bank",
      methods: [
        { value: "bank_transfer", label: "Virtual Account", description: "BCA, BNI, BRI, Mandiri, dll", icon: "🏦" },
      ],
    },
  ];

  const allMethods = paymentGroups.flatMap(g => g.methods);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data?.data || eventRes.data);
        const userRes = await api.get("/user").catch(() => null);
        if (userRes) setCurrentUser(userRes.data?.user || userRes.data?.data || userRes.data);
      } catch (err) {
        setError("Gagal memuat informasi event.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Listen for messages from Midtrans Snap embed iframe and react to result events
  useEffect(() => {
    const handleSnapMessage = (e) => {
      try {
        const d = e?.data;
        if (!d) return;

        // Midtrans sometimes uses data.sourceApp === 'snap' or data.source === 'snap'
        const isSnapMsg = d.source === 'snap' || d.sourceApp === 'snap' || d.app === 'snap';
        if (!isSnapMsg) return;

        const ev = d.event || d.type;
        if (!ev) return;

        // We care about the result event which indicates transaction result
        if (ev === 'result') {
          // payload may be in d.data or d
          const payload = d.data || d;
          const txStatus = payload?.transaction_status || payload?.status || String(payload?.status_code || '');

          // Treat settlement / capture / 200 as success
          if (txStatus === 'settlement' || txStatus === 'capture' || txStatus === '200') {
            setPaymentMessage('Pembayaran berhasil — notifikasi akan dikirim oleh server.');
            // Try to reset embedded snap UI and close the form after brief delay
            try { if (window.snap?.reset) window.snap.reset(); } catch (err) { /* ignore */ }
            // Refresh user's notifications (best-effort)
            api.get('/notifikasi').catch(() => {});
            setTimeout(() => setShowForm(false), 1200);
          } else if (txStatus === 'pending') {
            setPaymentMessage('Pembayaran tertunda. Menunggu konfirmasi.');
          } else {
            setPaymentMessage('Pembayaran gagal atau dibatalkan.');
          }
        }
      } catch (err) {
        console.error('Error handling snap message', err);
      }
    };

    window.addEventListener('message', handleSnapMessage);
    return () => window.removeEventListener('message', handleSnapMessage);
  }, []);

  // Realtime: initialize Echo (Pusher) and subscribe to private notifikasi channel for the current user
  useEffect(() => {
    if (!currentUser) return;

    const setupEcho = async () => {
      try {
        if (window.Echo) {
          // already initialized
          window.Echo.private(`notifikasi.${currentUser.id}`).listen('NotifikasiCreated', (payload) => {
            console.log('Realtime notifikasi received', payload);
            setPaymentMessage(payload.pesan || 'Anda menerima notifikasi baru');
            // Optionally fetch notifications list
            api.get('/notifikasi').catch(() => {});
          });
          return;
        }

        // dynamic import - only if packages installed
        const [PusherModule, EchoModule] = await Promise.all([
          import('pusher-js').catch(() => null),
          import('laravel-echo').catch(() => null),
        ]);

        if (!PusherModule || !EchoModule) {
          console.warn('Pusher/Echo not installed; realtime disabled. Run: npm install pusher-js laravel-echo');
          return;
        }

        const Pusher = PusherModule.default || PusherModule;
        const Echo = EchoModule.default || EchoModule;

        // Initialize Echo with sensible defaults for laravel-websockets or Pusher
        const token = localStorage.getItem('token');
        window.Pusher = Pusher;
        window.Echo = new Echo({
          broadcaster: 'pusher',
          key: import.meta.env.VITE_PUSHER_APP_KEY || import.meta.env.VITE_PUSHER_KEY || '',
          wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
          wsPort: import.meta.env.VITE_PUSHER_PORT ? Number(import.meta.env.VITE_PUSHER_PORT) : (window.location.protocol === 'https:' ? 6001 : 6001),
          forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || window.location.protocol.replace(':','')) === 'https',
          enabledTransports: ['ws', 'wss'],
          auth: {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        });

        window.Echo.private(`notifikasi.${currentUser.id}`).listen('NotifikasiCreated', (payload) => {
          console.log('Realtime notifikasi received', payload);
          setPaymentMessage(payload.pesan || 'Anda menerima notifikasi baru');
          api.get('/notifikasi').catch(() => {});
        });
      } catch (err) {
        console.error('Failed to initialize Echo', err);
      }
    };

    setupEcho();

    return () => {
      try {
        if (window.Echo && currentUser) {
          window.Echo.leave(`private-notifikasi.${currentUser.id}`);
        }
      } catch (err) {}
    };
  }, [currentUser]);

  // Polling pendaftaran status when pendaftaranId is set
  useEffect(() => {
    if (!pendaftaranId) return;

    // clear existing
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    const maxAttempts = 40; // ~5+ minutes depending on interval
    const intervalMs = 8000;

    const checkStatus = async () => {
      try {
        setPollAttempts((n) => n + 1);
        const res = await api.get(`/pendaftaran/${pendaftaranId}`);
        const data = res.data?.data || res.data;
        const status = data?.status;

        if (status && status !== 'menunggu') {
          if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }

          if (status === 'diterima') {
            setPaymentMessage('Pembayaran berhasil — notifikasi telah dikirim.');
            try { if (window.snap?.reset) window.snap.reset(); } catch (err) {}
            api.get('/notifikasi').catch(() => {});
            setTimeout(() => setShowForm(false), 1000);
          } else {
            setPaymentMessage(`Pembayaran status: ${status}.`);
          }
        }
      } catch (err) {
        console.error('Polling pendaftaran error', err);
      }
    };

    // initial immediate check
    checkStatus();
    pollingRef.current = setInterval(() => {
      if (pollAttempts >= maxAttempts) {
        clearInterval(pollingRef.current); pollingRef.current = null;
        setPaymentMessage('Timeout menunggu status pembayaran. Cek notifikasi atau hubungi panitia.');
        return;
      }
      checkStatus();
    }, intervalMs);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); pollingRef.current = null; };
  }, [pendaftaranId, pollAttempts]);

  const handleToggleForm = () => {
    if (!currentUser) { alert("Silakan login terlebih dahulu!"); navigate("/login"); return; }
    const phone = currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number;
    if (!phone || phone.trim() === "" || phone.trim() === "-") {
      alert("Silakan isi nomor WhatsApp di profil terlebih dahulu!");
      navigate("/profile"); return;
    }
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("event_id", id);
      formDataToSend.append("nama_tim", namaTim);
      formDataToSend.append("kelompok_umur", kelompokUmur);
      formDataToSend.append("payment_method", paymentMethod);
      if (logoTim) formDataToSend.append("logo_tim", logoTim);
      formDataToSend.append("email_pendaftar", currentUser?.email || "");
      formDataToSend.append("no_wa_pendaftar", currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number || "");

      const res = await api.post(`/pendaftaran`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      let responseData = res.data;
      if (typeof responseData === "string") {
        const jsonStart = responseData.indexOf("{");
        responseData = JSON.parse(responseData.substring(jsonStart));
      }

      // Set payment data dari Core API
      setPaymentData(responseData?.payment_data || responseData);

      // jika server mengembalikan ID pendaftaran, simpan untuk mulai polling
      const pId = responseData?.pendaftaran?.id || responseData?.pendaftaran_id || responseData?.data?.pendaftaran?.id || responseData?.data?.id;
      if (pId) {
        setPendaftaranId(pId);
        setPollAttempts(0);
      }

      setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mendaftar, coba lagi.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#07090f] text-white flex items-center justify-center">
      <span className="loading loading-spinner loading-md text-[#ff4800]"></span>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen bg-[#07090f] text-white flex flex-col items-center justify-center gap-4">
      <div className="text-sm text-red-500">⚠️ {error || "Event tidak ditemukan"}</div>
      <button onClick={() => navigate("/")} className="btn btn-xs bg-white/10 text-white">Kembali</button>
    </div>
  );

  const filled = event.pendaftaran_count ?? 0;
  const total = event.kuota_tim ?? 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const sisa = total - filled;
  const isClosed = event.status === "draft" || event.status === "selesai" || sisa <= 0;
  const selectedMethod = allMethods.find(m => m.value === paymentMethod);

  return (
    <div className="min-h-screen bg-[#07090f] text-white pb-20">

      {/* DETAIL EVENT */}
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
                  {event.deskripsi || "Format sistem gugur. Maksimal 10 pemain per tim (5 inti + 5 cadangan)."}
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
            <button
              disabled={isClosed}
              onClick={handleToggleForm}
              className={`btn btn-md w-full font-bold uppercase tracking-wider ${isClosed ? "btn-disabled bg-white/5 text-white/20" : "bg-[#ff4800] hover:bg-[#e03e00] text-white border-none shadow-md"}`}
            >
              {isClosed ? "Pendaftaran Ditutup" : "Lanjutkan Pendaftaran ↓"}
            </button>
          )}
        </div>
      </div>

      {/* FORM PENDAFTARAN */}
      {showForm && !paymentData && (
        <div ref={formRef} className="max-w-4xl mx-auto px-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#111422] border border-[#ff4800]/20 rounded-2xl p-6 md:p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ff4800] rounded-t-2xl" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-white">Formulir Registrasi Tim</h2>
                <p className="text-xs text-white/50">Lengkapi data dan pilih metode pembayaran</p>
              </div>
              <button onClick={() => setShowForm(false)} className="btn btn-xs btn-ghost text-white/40">Batal</button>
            </div>

            {/* Info Akun */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-6 flex flex-wrap gap-4 justify-between text-xs">
              <div><span className="text-white/40 block">Manajer:</span><span className="font-bold text-white">{currentUser?.name || "—"}</span></div>
              <div><span className="text-white/40 block">WhatsApp:</span><span className="font-semibold text-white/80">{currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number}</span></div>
              <div><span className="text-white/40 block">Email:</span><span className="font-semibold text-white/80">{currentUser?.email || "—"}</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Data Tim */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label py-1"><span className="label-text text-xs text-white/70 font-semibold">Nama Tim</span></label>
                  <input type="text" required placeholder="Contoh: SFC Garuda"
                    value={namaTim} onChange={(e) => setNamaTim(e.target.value)}
                    className="input input-sm h-10 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:border-[#ff4800]"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label py-1"><span className="label-text text-xs text-white/70 font-semibold">Kelompok Umur</span></label>
                  <select required value={kelompokUmur} onChange={(e) => setKelompokUmur(e.target.value)}
                    className="select select-sm h-10 bg-[#111422] border border-white/10 rounded-lg text-white text-xs focus:border-[#ff4800]"
                  >
                    <option value="" disabled>Pilih Kelompok Umur</option>
                    {Array.from({ length: 11 }, (_, i) => i + 12).map(u => (
                      <option key={u} value={`U-${u}`}>U-{u}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control w-full md:col-span-2">
                  <label className="label py-1"><span className="label-text text-xs text-white/70 font-semibold">Logo Tim (.PNG/.JPG)</span></label>
                  <input type="file" accept="image/*" required onChange={(e) => e.target.files[0] && setLogoTim(e.target.files[0])}
                    className="file-input file-input-bordered file-input-sm bg-white/5 text-white/70 text-xs w-full border-white/10 rounded-lg"
                  />
                </div>
              </div>

              {/* Pilih Metode Pembayaran */}
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-4">Pilih Metode Pembayaran</p>
                <div className="space-y-4">
                  {paymentGroups.map(({ title, subtitle, badge, methods }) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-white/40">{title}</p>
                          <p className="text-xs text-white/60">{subtitle}</p>
                        </div>
                        {badge && <span className="text-[10px] font-black uppercase bg-[#ff4800] text-white px-2 py-0.5 rounded-full">{badge}</span>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {methods.map((method) => (
                          <button key={method.value} type="button"
                            onClick={() => setPaymentMethod(method.value)}
                            className={`rounded-xl border p-3 text-left transition-all ${paymentMethod === method.value
                              ? "border-[#ff4800] bg-[#ff4800]/10 text-white shadow-[0_0_20px_rgba(255,72,0,0.15)]"
                              : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{method.icon}</span>
                                <div>
                                  <p className="text-xs font-bold">{method.label}</p>
                                  <p className="text-[10px] text-white/40">{method.description}</p>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === method.value ? "border-[#ff4800] bg-[#ff4800]" : "border-white/20"}`}>
                                {paymentMethod === method.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ringkasan */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-white/40">Metode terpilih</p>
                  <p className="font-bold text-white">{selectedMethod?.icon} {selectedMethod?.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Total Bayar</p>
                  <p className="font-black text-[#ff4800] text-lg">{fmtCurrency(event.biaya_pendaftaran)}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-2 border-t border-white/5">
                <p className="text-[11px] text-white/30 max-w-sm">Identitas akun Anda akan otomatis digunakan sebagai perwakilan tim.</p>
                <button type="submit" disabled={submitting}
                  className="btn btn-sm min-h-[42px] bg-[#ff4800] hover:bg-[#e03e00] text-white border-none font-bold text-xs px-8 rounded-xl w-full md:w-auto shadow-md"
                >
                  {submitting ? <><span className="loading loading-spinner loading-xs"></span> Memproses...</> : "Daftar & Lanjut Bayar →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAMPILAN PEMBAYARAN */}
      {paymentData && (
        <div ref={paymentRef} className="max-w-md mx-auto px-6 mt-6 animate-in zoom-in-95 duration-300">
          <PaymentResult
            paymentData={paymentData}
            paymentMethod={paymentMethod}
            event={event}
            namaTim={namaTim}
            onClose={() => { setPaymentData(null); setShowForm(false); }}
          />
        </div>
      )}

    </div>
  );
}