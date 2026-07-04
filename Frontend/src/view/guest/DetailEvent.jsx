import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../data/api";

const fmtDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date
    .toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(".", ":");
};

const fmtCurrency = (amount) => {
  if (amount === undefined || amount === null || amount === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

/* ───────────────────────── Shared bits ───────────────────────── */

function SummaryRow({ label, value, strong }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40">{label}</span>
      <span className={`font-semibold ${strong ? "text-white" : "text-white/80"}`}>{value}</span>
    </div>
  );
}

/* ───────────────────────── Payment result ───────────────────────── */

function PaymentResult({ paymentData, paymentMethod, event, namaTim, paymentStatus, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shell = "rounded-2xl border bg-[#0f1120] p-6 space-y-5";

  if (paymentStatus === "diterima") {
    return (
      <div className={`${shell} border-emerald-500/25 text-center`}>
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 text-2xl font-bold">
          ✓
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Pembayaran Berhasil</p>
          <h3 className="text-lg font-black text-white">Pendaftaran Dikonfirmasi</h3>
          <p className="text-xs text-white/45 max-w-sm mx-auto">
            Tim <span className="text-white font-semibold">{namaTim}</span> resmi terdaftar di{" "}
            <span className="text-white font-semibold">{event?.nama_event}</span>.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left space-y-2 text-xs">
          <SummaryRow label="Event" value={event?.nama_event} />
          <SummaryRow label="Tim" value={namaTim} />
          <div className="h-px bg-white/10 my-1" />
          <SummaryRow label="Status" value="Diterima · Lunas" strong />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => window.location.reload()}
            className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors"
          >
            Selesai
          </button>
          <button
            onClick={onClose}
            className="h-9 rounded-xl border border-white/10 text-white/45 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "ditolak") {
    return (
      <div className={`${shell} border-red-500/25 text-center`}>
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 text-2xl font-bold">
          ✕
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold">Pembayaran Gagal</p>
          <h3 className="text-lg font-black text-white">Transaksi Ditolak</h3>
          <p className="text-xs text-white/45 max-w-sm mx-auto">
            Pembayaran ditolak atau sudah kedaluwarsa. Silakan daftar ulang atau hubungi panitia.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const total = fmtCurrency(event?.biaya_pendaftaran);

  if (paymentMethod === "qris") {
    return (
      <div className={`${shell} border-white/10 text-center`}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#ff4800] font-bold mb-1">Scan & Bayar</p>
          <h3 className="text-base font-black text-white">QRIS</h3>
          <p className="text-xs text-white/45 mt-0.5">Pakai aplikasi e-wallet atau m-banking apa pun</p>
        </div>

        <div className="bg-white rounded-xl p-4 inline-block mx-auto">
          {paymentData?.qr_code_url ? (
            <img src={paymentData.qr_code_url} alt="QRIS" className="w-48 h-48 object-contain mx-auto" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">QR tidak tersedia</div>
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left space-y-2 text-xs">
          <SummaryRow label="Event" value={event?.nama_event} />
          <SummaryRow label="Tim" value={namaTim} />
          <div className="h-px bg-white/10 my-1" />
          <SummaryRow label="Total" value={total} strong />
        </div>

        <p className="text-[11px] text-white/35">
          Berlaku hingga <span className="text-white/65">{paymentData?.expiry_time || "15 menit"}</span>
        </p>

        <button
          onClick={onClose}
          className="text-[11px] text-white/40 hover:text-white border border-white/10 hover:bg-white/5 rounded-full px-5 h-8 transition-colors"
        >
          Tutup
        </button>
      </div>
    );
  }

  if (paymentMethod === "gopay" || paymentMethod === "shopeepay") {
    const label = paymentMethod === "gopay" ? "GoPay" : "ShopeePay";
    const deeplink = paymentData?.deeplink_url || paymentData?.actions?.find((a) => a.name === "deeplink-redirect")?.url;
    const qrUrl = paymentData?.qr_code_url || paymentData?.actions?.find((a) => a.name === "generate-qr-code")?.url;

    return (
      <div className={`${shell} border-white/10 text-center`}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#ff4800] font-bold mb-1">Pembayaran</p>
          <h3 className="text-base font-black text-white">{label}</h3>
        </div>

        {qrUrl && (
          <div className="bg-white rounded-xl p-4 inline-block mx-auto">
            <img src={qrUrl} alt={label} className="w-48 h-48 object-contain mx-auto" />
          </div>
        )}

        {deeplink && (
          <a
            href={deeplink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-10 leading-10 rounded-xl bg-[#ff4800] hover:bg-[#e03e00] text-white text-sm font-bold transition-colors"
          >
            Buka Aplikasi {label}
          </a>
        )}

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left space-y-2 text-xs">
          <SummaryRow label="Event" value={event?.nama_event} />
          <SummaryRow label="Tim" value={namaTim} />
          <div className="h-px bg-white/10 my-1" />
          <SummaryRow label="Total" value={total} strong />
        </div>

        <button
          onClick={onClose}
          className="text-[11px] text-white/40 hover:text-white border border-white/10 hover:bg-white/5 rounded-full px-5 h-8 transition-colors"
        >
          Tutup
        </button>
      </div>
    );
  }

  if (paymentMethod?.startsWith("bank_transfer")) {
    const isMandiri = paymentData?.bill_key && paymentData?.biller_code;
    const vaNumber = isMandiri
      ? paymentData.bill_key
      : paymentData?.va_numbers?.[0]?.va_number || paymentData?.permata_va_number || "—";
    const bank = isMandiri
      ? "MANDIRI"
      : paymentData?.va_numbers?.[0]?.bank?.toUpperCase() ||
      (paymentMethod === "bank_transfer_permata" ? "PERMATA" : "BANK");

    return (
      <div className={`${shell} border-white/10`}>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#ff4800] font-bold mb-1">Transfer Bank</p>
          <h3 className="text-base font-black text-white">Virtual Account {bank}</h3>
          <p className="text-xs text-white/45 mt-0.5">Transfer sesuai nomor di bawah ini</p>
        </div>

        <div className="bg-white/[0.03] border border-[#ff4800]/25 rounded-xl p-4 text-center">
          {isMandiri && (
            <div className="mb-3">
              <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1">Kode Perusahaan</p>
              <p className="text-base font-bold text-white tracking-widest">{paymentData.biller_code}</p>
            </div>
          )}
          <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">
            {isMandiri ? "Kode Bayar" : "Nomor Virtual Account"}
          </p>
          <p className="text-2xl font-black text-white tracking-widest">{vaNumber}</p>
          <button
            onClick={() => copyToClipboard(vaNumber)}
            className="mt-3 h-8 px-4 rounded-full bg-[#ff4800]/15 border border-[#ff4800]/30 text-[#ff4800] text-xs font-bold hover:bg-[#ff4800]/25 transition-colors"
          >
            {copied ? "✓ Tersalin" : isMandiri ? "Salin Kode Bayar" : "Salin Nomor"}
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left space-y-2 text-xs">
          <SummaryRow label="Event" value={event?.nama_event} />
          <SummaryRow label="Tim" value={namaTim} />
          <div className="h-px bg-white/10 my-1" />
          <SummaryRow label="Total Transfer" value={total} strong />
        </div>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-300/90">
          Transfer sesuai nominal — verifikasi otomatis dalam 1–5 menit.
        </div>

        <p className="text-[11px] text-white/35 text-center">
          Berlaku hingga <span className="text-white/65">{paymentData?.expiry_time || "24 jam"}</span>
        </p>

        <button
          onClick={onClose}
          className="w-full text-[11px] text-white/40 hover:text-white border border-white/10 hover:bg-white/5 rounded-full h-8 transition-colors"
        >
          Tutup
        </button>
      </div>
    );
  }

  return null;
}

/* ───────────────────────── Page ───────────────────────── */

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
  const [paymentData, setPaymentData] = useState(null);
  const [pendaftaranId, setPendaftaranId] = useState(null);
  const pollingRef = useRef(null);
  const pollAttemptsRef = useRef(0);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("menunggu");

  const [existingTeams, setExistingTeams] = useState([]);
  const [teamMode, setTeamMode] = useState("new"); // "new" | "existing"
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);
  const [myMatches, setMyMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loadingParticipantData, setLoadingParticipantData] = useState(false);

  const paymentGroups = [
    {
      title: "QRIS",
      subtitle: "Satu QR untuk semua metode",
      badge: "TERMURAH",
      methods: [{ value: "qris", label: "QRIS", description: "GoPay, OVO, Dana, semua bank", icon: "🔲" }],
    },
    {
      title: "E-Wallet",
      methods: [
        { value: "gopay", label: "GoPay", description: "Bayar lewat aplikasi Gojek", icon: "💚" },
        { value: "shopeepay", label: "ShopeePay", description: "Bayar lewat aplikasi Shopee", icon: "🧡" },
      ],
    },
    {
      title: "Virtual Account",
      methods: [
        { value: "bank_transfer_bca", label: "BCA", description: "Virtual Account BCA", icon: "🔵" },
        { value: "bank_transfer_bni", label: "BNI", description: "Virtual Account BNI", icon: "🟠" },
        { value: "bank_transfer_bri", label: "BRI", description: "Virtual Account BRI", icon: "🔵" },
        { value: "bank_transfer_mandiri", label: "Mandiri", description: "Virtual Account Mandiri", icon: "🟡" },
        { value: "bank_transfer_permata", label: "Permata", description: "Virtual Account Permata", icon: "🟢" },
      ],
    },
  ];

  const allMethods = paymentGroups.flatMap((g) => g.methods);

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

  useEffect(() => {
    const loadParticipantData = async () => {
      if (!id) return;

      setLoadingParticipantData(true);
      try {
        if (!currentUser) {
          const standingsRes = await api.get("/klasemen", { params: { event_id: id } });
          setStandings(standingsRes.data?.data || []);
          setMyRegistration(null);
          setMyMatches([]);
          return;
        }

        const [registrationRes, standingsRes] = await Promise.all([
          api.get("/pendaftaran", { params: { event_id: id } }),
          api.get("/klasemen", { params: { event_id: id } }),
        ]);

        const registrations = registrationRes.data?.data || [];
        const registration = registrations.find((item) => item?.tim?.id) || null;
        setMyRegistration(registration);
        setStandings(standingsRes.data?.data || []);

        if (registration?.tim?.id) {
          const matchesRes = await api.get("/jadwal-pertandingan", {
            params: { event_id: id, tim_id: registration.tim.id },
          });
          setMyMatches(matchesRes.data?.data || []);
        } else {
          setMyMatches([]);
        }
      } catch (err) {
        console.error("Gagal memuat data peserta event", err);
        setMyRegistration(null);
        setMyMatches([]);
        setStandings([]);
      } finally {
        setLoadingParticipantData(false);
      }
    };

    loadParticipantData();
  }, [id, currentUser]);

  // Listen for messages from Midtrans Snap embed iframe
  useEffect(() => {
    const handleSnapMessage = (e) => {
      try {
        const d = e?.data;
        if (!d) return;

        const isSnapMsg = d.source === "snap" || d.sourceApp === "snap" || d.app === "snap";
        if (!isSnapMsg) return;

        const ev = d.event || d.type;
        if (!ev || ev !== "result") return;

        const payload = d.data || d;
        const txStatus = payload?.transaction_status || payload?.status || String(payload?.status_code || "");

        if (txStatus === "settlement" || txStatus === "capture" || txStatus === "200") {
          setPaymentMessage("Pembayaran berhasil — notifikasi akan dikirim oleh server.");
          try {
            if (window.snap?.reset) window.snap.reset();
          } catch (err) {
            /* ignore */
          }
          api.get("/notifikasi").catch(() => { });
          setTimeout(() => setShowForm(false), 1200);
        } else if (txStatus === "pending") {
          setPaymentMessage("Pembayaran tertunda. Menunggu konfirmasi.");
        } else {
          setPaymentMessage("Pembayaran gagal atau dibatalkan.");
        }
      } catch (err) {
        console.error("Error handling snap message", err);
      }
    };

    window.addEventListener("message", handleSnapMessage);
    return () => window.removeEventListener("message", handleSnapMessage);
  }, []);

  // Realtime: Echo (Pusher) subscription for current user's notifications
  useEffect(() => {
    if (!currentUser) return;

    const setupEcho = async () => {
      try {
        if (window.Echo) {
          window.Echo.private(`notifikasi.${currentUser.id}`).listen("NotifikasiCreated", (payload) => {
            setPaymentMessage(payload.pesan || "Anda menerima notifikasi baru");
            api.get("/notifikasi").catch(() => { });
          });
          return;
        }

        const [PusherModule, EchoModule] = await Promise.all([
          import("pusher-js").catch(() => null),
          import("laravel-echo").catch(() => null),
        ]);

        if (!PusherModule || !EchoModule) {
          console.warn("Pusher/Echo not installed; realtime disabled. Run: npm install pusher-js laravel-echo");
          return;
        }

        const Pusher = PusherModule.default || PusherModule;
        const Echo = EchoModule.default || EchoModule;
        const token = localStorage.getItem("token");

        window.Pusher = Pusher;
        window.Echo = new Echo({
          broadcaster: "pusher",
          key: import.meta.env.VITE_PUSHER_APP_KEY || import.meta.env.VITE_PUSHER_KEY || "",
          wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
          wsPort: import.meta.env.VITE_PUSHER_PORT ? Number(import.meta.env.VITE_PUSHER_PORT) : 6001,
          forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || window.location.protocol.replace(":", "")) === "https",
          enabledTransports: ["ws", "wss"],
          auth: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        });

        window.Echo.private(`notifikasi.${currentUser.id}`).listen("NotifikasiCreated", (payload) => {
          setPaymentMessage(payload.pesan || "Anda menerima notifikasi baru");
          api.get("/notifikasi").catch(() => { });
        });
      } catch (err) {
        console.error("Failed to initialize Echo", err);
      }
    };

    setupEcho();

    return () => {
      try {
        if (window.Echo && currentUser) window.Echo.leave(`private-notifikasi.${currentUser.id}`);
      } catch (err) {
        /* ignore */
      }
    };
  }, [currentUser]);

  // Poll pendaftaran status
  useEffect(() => {
    if (!pendaftaranId) return;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    const maxAttempts = 40;
    const intervalMs = 8000;

    const checkStatus = async () => {
      try {
        pollAttemptsRef.current += 1;
        const res = await api.get(`/pendaftaran/${pendaftaranId}`);
        const data = res.data?.data || res.data;
        const status = data?.status;

        if (status) setPaymentStatus(status);

        if (status && status !== "menunggu") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          if (status === "diterima") {
            setPaymentMessage("Pembayaran berhasil — notifikasi telah dikirim.");
            try {
              if (window.snap?.reset) window.snap.reset();
            } catch (err) {
              /* ignore */
            }
            api.get("/notifikasi").catch(() => { });
          } else {
            setPaymentMessage(`Pembayaran status: ${status}.`);
          }
        }
      } catch (err) {
        console.error("Polling pendaftaran error", err);
      }
    };

    checkStatus();
    pollingRef.current = setInterval(() => {
      if (pollAttemptsRef.current >= maxAttempts) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setPaymentMessage("Timeout menunggu status pembayaran. Cek notifikasi atau hubungi panitia.");
        return;
      }
      checkStatus();
    }, intervalMs);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [pendaftaranId]);

  const handleToggleForm = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    api
      .get("/tim/my-teams")
      .then((res) => {
        const teams = res.data?.data || [];
        setExistingTeams(teams);
        if (teams.length > 0) {
          setTeamMode("existing");
          const first = teams[0];
          setSelectedTeamId(first.id);
          setNamaTim(first.nama_tim);
          setKelompokUmur(first.kelompok_umur);
        } else {
          setTeamMode("new");
        }
      })
      .catch(() => setTeamMode("new"));
  };

  const handleSelectExistingTeam = (team) => {
    setSelectedTeamId(team.id);
    setNamaTim(team.nama_tim);
    setKelompokUmur(team.kelompok_umur);
    setLogoTim(null);
  };

  const handleSwitchToNewTeam = () => {
    setTeamMode("new");
    setSelectedTeamId(null);
    setNamaTim("");
    setKelompokUmur("");
    setLogoTim(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("event_id", id);
      formDataToSend.append("payment_method", paymentMethod);
      if (teamMode === "existing" && selectedTeamId) {
        formDataToSend.append("tim_id", selectedTeamId);
      } else {
        formDataToSend.append("nama_tim", namaTim);
        formDataToSend.append("kelompok_umur", kelompokUmur);
        if (logoTim) formDataToSend.append("logo_tim", logoTim);
      }
      formDataToSend.append("email_pendaftar", currentUser?.email || "");
      formDataToSend.append("no_wa_pendaftar", currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number || "");

      const res = await api.post(`/pendaftaran`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let responseData = res.data;
      if (typeof responseData === "string") {
        const jsonStart = responseData.indexOf("{");
        responseData = JSON.parse(responseData.substring(jsonStart));
      }

      setPaymentData(responseData?.payment_data || responseData);

      const pId =
        responseData?.pendaftaran?.id ||
        responseData?.pendaftaran_id ||
        responseData?.data?.pendaftaran?.id ||
        responseData?.data?.id;
      if (pId) {
        setPendaftaranId(pId);
        pollAttemptsRef.current = 0;
        setPaymentStatus("menunggu");
      }

      setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mendaftar, coba lagi.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-white/15 border-t-[#ff4800] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#07090f] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-400">{error || "Event tidak ditemukan"}</p>
        <button
          onClick={() => navigate("/")}
          className="h-9 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const filled = event.pendaftaran_count ?? 0;
  const total = event.kuota_tim ?? 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const sisa = total - filled;
  const isClosed = event.status === "draft" || event.status === "selesai" || sisa <= 0;
  const selectedMethod = allMethods.find((m) => m.value === paymentMethod);
  const apiOrigin = (import.meta.env.VITE_API_URL || "").replace("/api", "");

  return (
    <div className="min-h-screen bg-[#07090f] text-white">
      {/* ── Header ── */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <nav className="flex items-center gap-1.5 text-[11px] text-white/30 mb-5 uppercase tracking-widest font-medium">
            <Link to="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link to="/event" className="hover:text-white transition-colors">
              Event
            </Link>
            <span>/</span>
            <span className="text-[#ff4800]">Detail</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="space-y-2.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#ff4800]/10 text-[#ff4800] border border-[#ff4800]/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4800]" />
                {event.status === "aktif" ? "Pendaftaran Dibuka" : event.status === "selesai" ? "Selesai" : "Draft"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{event.nama_event}</h1>
              <p className="text-sm text-white/40">{event.lokasi}</p>
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Biaya Pendaftaran</p>
              <p className="text-2xl font-black text-[#ff4800]">{fmtCurrency(event.biaya_pendaftaran)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-8 self-start">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0f1120] p-5 space-y-4">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Informasi Event</p>
              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-white/30 mb-0.5">Jadwal</dt>
                  <dd className="text-white/75 font-medium leading-relaxed">
                    {fmtDate(event.tanggal_mulai)}
                    <br />
                    <span className="text-white/30">s/d</span> {fmtDate(event.tanggal_selesai)}
                  </dd>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div>
                  <dt className="text-white/30 mb-0.5">Kuota Tim</dt>
                  <dd className="text-white/75 font-medium">{total} Tim</dd>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div>
                  <dt className="text-white/30 mb-0.5">Lokasi</dt>
                  <dd className="text-white/75 font-medium">{event.lokasi}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#0f1120] p-5 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Slot Tersedia</p>
                <span
                  className={`text-[10px] font-bold ${sisa <= 0 ? "text-red-400" : sisa <= 3 ? "text-amber-400" : "text-emerald-400"
                    }`}
                >
                  {sisa <= 0 ? "Penuh" : `${sisa} sisa`}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-white/35">
                  <span>{filled} terdaftar</span>
                  <span>{total} total</span>
                </div>
              </div>
            </div>

            {!showForm && !paymentData && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    disabled={isClosed}
                    onClick={handleToggleForm}
                    className={`h-12 rounded-xl font-bold text-sm transition-colors ${isClosed
                        ? "bg-white/5 text-white/25 cursor-not-allowed"
                        : "bg-[#ff4800] hover:bg-[#e03e00] text-white"
                      }`}
                  >
                    {isClosed ? "Pendaftaran Ditutup" : "Daftar Sekarang"}
                  </button>
                </div>
                <div className="rounded-xl border border-[#ff4800]/20 bg-[#ff4800]/10 px-3 py-2 text-[11px] leading-relaxed text-[#ffb08a]">
                  Setelah daftar, lihat jadwal dan klasemen tim Anda langsung di halaman ini.
                </div>
              </div>
            )}

            {showForm && !paymentData && (
              <button
                onClick={() => setShowForm(false)}
                className="w-full h-10 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                Tutup Formulir
              </button>
            )}
          </aside>

          {/* Main column */}
          <main className="space-y-6 min-w-0">
            <section className="rounded-2xl border border-white/[0.07] bg-[#0f1120] p-6">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-3">Tentang Event</p>
              <p className="text-sm text-white/55 leading-relaxed whitespace-pre-line">
                {event.deskripsi ||
                  "Format sistem gugur. Maksimal 10 pemain per tim (5 inti + 5 cadangan). Peserta wajib hadir 30 menit sebelum pertandingan dimulai."}
              </p>
            </section>

            <section id="participant-info" className="rounded-2xl border border-white/[0.07] bg-[#0f1120] p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Jadwal Tim Anda</p>
                  <h2 className="text-lg font-black text-white">Kapan timmu main?</h2>
                </div>
                {myRegistration?.tim?.nama_tim && (
                  <span className="inline-flex items-center rounded-full border border-[#ff4800]/20 bg-[#ff4800]/10 px-3 py-1 text-[11px] font-semibold text-[#ff4800]">
                    {myRegistration.tim.nama_tim}
                  </span>
                )}
              </div>

              {!currentUser ? (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-white/50">
                  Login untuk melihat jadwal tim Anda di event ini.
                </div>
              ) : !myRegistration ? (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-white/50">
                  Anda belum terdaftar di event ini, jadi belum ada jadwal yang bisa ditampilkan.
                </div>
              ) : loadingParticipantData ? (
                <div className="text-sm text-white/50">Memuat jadwal pertandingan...</div>
              ) : myMatches.length ? (
                <div className="space-y-2">
                  {myMatches.map((match) => (
                    <div key={match.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {match.tim_1_nama || "Tim 1"} vs {match.tim_2_nama || "Tim 2"}
                          </p>
                          <p className="mt-1 text-[11px] text-white/40">
                            {fmtDate(match.waktu_pertandingan)} • {match.lokasi_lapangan || event.lokasi}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {match.status === "selesai" ? (
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                              {match.skor_tim_1 ?? 0} - {match.skor_tim_2 ?? 0}
                            </span>
                          ) : match.status === "berlangsung" ? (
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
                              Berlangsung
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/60">
                              Terjadwal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-white/50">
                  Belum ada jadwal pertandingan untuk tim Anda dalam event ini.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/[0.07] bg-[#0f1120] p-6 space-y-4">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Klasemen Event</p>
                <h2 className="text-lg font-black text-white">Riwayat klasemen event ini</h2>
              </div>

              {standings.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-white/40">
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 pr-3">Tim</th>
                        <th className="py-2 pr-3">Main</th>
                        <th className="py-2 pr-3">Menang</th>
                        <th className="py-2 pr-3">Seri</th>
                        <th className="py-2 pr-3">Kalah</th>
                        <th className="py-2 pr-3">GM</th>
                        <th className="py-2 pr-3">GK</th>
                        <th className="py-2 pr-3">+/-</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={team.tim_id || team.id || index} className="border-b border-white/[0.04] text-white/70">
                          <td className="py-3 pr-3 font-semibold text-white">{index + 1}</td>
                          <td className="py-3 pr-3">{team.nama_tim || "—"}</td>
                          <td className="py-3 pr-3">{team.main ?? 0}</td>
                          <td className="py-3 pr-3">{team.menang ?? 0}</td>
                          <td className="py-3 pr-3">{team.seri ?? 0}</td>
                          <td className="py-3 pr-3">{team.kalah ?? 0}</td>
                          <td className="py-3 pr-3">{team.gol_masuk ?? 0}</td>
                          <td className="py-3 pr-3">{team.gol_kemasukan ?? 0}</td>
                          <td className="py-3 pr-3">{team.selisih_gol ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-white/50">
                  Belum ada data klasemen untuk event ini.
                </div>
              )}
            </section>

            {showForm && !paymentData && (
              <section
                ref={formRef}
                className="rounded-2xl border border-[#ff4800]/20 bg-[#0f1120] p-6 space-y-6"
              >
                <div>
                  <p className="text-[10px] text-[#ff4800] uppercase tracking-widest font-bold mb-1">
                    Formulir Registrasi
                  </p>
                  <h2 className="text-lg font-black text-white">Data Tim & Pembayaran</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                  <div>
                    <p className="text-white/30 uppercase tracking-wider text-[10px]">Manajer</p>
                    <p className="font-semibold text-white/80 mt-0.5 truncate">{currentUser?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/30 uppercase tracking-wider text-[10px]">WhatsApp</p>
                    <p className="font-semibold text-white/70 mt-0.5 truncate">
                      {currentUser?.no_wa || currentUser?.phone || currentUser?.phone_number || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/30 uppercase tracking-wider text-[10px]">Email</p>
                    <p className="font-semibold text-white/70 mt-0.5 truncate">{currentUser?.email || "—"}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {existingTeams.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Pilih Tim</p>

                      <div className="flex rounded-xl border border-white/10 overflow-hidden text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setTeamMode("existing")}
                          className={`flex-1 h-10 transition-colors ${teamMode === "existing"
                              ? "bg-[#ff4800] text-white"
                              : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70"
                            }`}
                        >
                          Tim Lama
                        </button>
                        <button
                          type="button"
                          onClick={handleSwitchToNewTeam}
                          className={`flex-1 h-10 transition-colors ${teamMode === "new"
                              ? "bg-[#ff4800] text-white"
                              : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70"
                            }`}
                        >
                          + Tim Baru
                        </button>
                      </div>

                      {teamMode === "existing" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-0.5">
                          {existingTeams.map((team) => (
                            <button
                              type="button"
                              key={team.id}
                              onClick={() => handleSelectExistingTeam(team)}
                              className={`rounded-xl border p-3 text-left transition-colors ${selectedTeamId === team.id
                                  ? "border-[#ff4800] bg-[#ff4800]/[0.08]"
                                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {team.logo_tim ? (
                                  <img
                                    src={`${apiOrigin}/storage/${team.logo_tim}`}
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm shrink-0">
                                    ⚽
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-white truncate">{team.nama_tim}</p>
                                  <p className="text-[10px] text-white/35">{team.kelompok_umur}</p>
                                </div>
                                {selectedTeamId === team.id && (
                                  <div className="w-4 h-4 rounded-full bg-[#ff4800] flex items-center justify-center shrink-0">
                                    <span className="text-white text-[9px] font-black">✓</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {teamMode === "existing" && selectedTeamId ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#ff4800]/[0.05] border border-[#ff4800]/15">
                      <div className="w-10 h-10 rounded-xl bg-[#ff4800]/10 flex items-center justify-center text-lg shrink-0">
                        ⚽
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Tim Terpilih</p>
                        <p className="text-sm font-black text-white truncate">{namaTim}</p>
                        <span className="text-[11px] text-[#ff4800] font-bold">{kelompokUmur}</span>
                      </div>
                      <p className="text-[10px] text-white/25 text-right shrink-0">Terisi otomatis</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">
                          Nama Tim
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: SFC Garuda"
                          value={namaTim}
                          onChange={(e) => setNamaTim(e.target.value)}
                          className="w-full h-10 bg-white/[0.03] border border-white/10 rounded-xl px-3 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#ff4800]/60 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">
                          Kelompok Umur
                        </label>
                        <select
                          required
                          value={kelompokUmur}
                          onChange={(e) => setKelompokUmur(e.target.value)}
                          className="w-full h-10 bg-[#0d0f1e] border border-white/10 rounded-xl px-3 text-white text-xs focus:outline-none focus:border-[#ff4800]/60 transition-colors"
                        >
                          <option value="" disabled>
                            Pilih U-...
                          </option>
                          {Array.from({ length: 11 }, (_, i) => i + 12).map((u) => (
                            <option key={u} value={`U-${u}`}>
                              U-{u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Logo Tim (PNG / JPG)
                      </label>
                      {teamMode === "existing" && selectedTeamId && (
                        <span className="text-[10px] text-white/25">Upload ulang per pendaftaran</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      required={teamMode === "new"}
                      onChange={(e) => e.target.files[0] && setLogoTim(e.target.files[0])}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2.5 text-white/45 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#ff4800]/10 file:text-[#ff4800] file:text-xs file:font-bold hover:file:bg-[#ff4800]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">
                      Metode Pembayaran
                    </p>
                    <div className="space-y-4">
                      {paymentGroups.map(({ title, badge, methods }) => (
                        <div key={title}>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">{title}</p>
                            {badge && (
                              <span className="text-[9px] font-bold bg-[#ff4800] text-white px-1.5 py-0.5 rounded-full uppercase">
                                {badge}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {methods.map((method) => (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() => setPaymentMethod(method.value)}
                                className={`rounded-xl border p-3 text-left transition-colors ${paymentMethod === method.value
                                    ? "border-[#ff4800]/50 bg-[#ff4800]/[0.08] text-white"
                                    : "border-white/[0.07] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80"
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{method.icon}</span>
                                    <div>
                                      <p className="text-xs font-bold">{method.label}</p>
                                      <p className="text-[10px] text-white/30">{method.description}</p>
                                    </div>
                                  </div>
                                  <div
                                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === method.value ? "border-[#ff4800] bg-[#ff4800]" : "border-white/15"
                                      }`}
                                  >
                                    {paymentMethod === method.value && <div className="w-1 h-1 rounded-full bg-white" />}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Metode Terpilih</p>
                        <p className="text-sm font-bold text-white mt-0.5">
                          {selectedMethod?.icon} {selectedMethod?.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Total Bayar</p>
                        <p className="text-xl font-black text-[#ff4800] mt-0.5">{fmtCurrency(event.biaya_pendaftaran)}</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 rounded-xl bg-[#ff4800] hover:bg-[#e03e00] disabled:bg-white/5 disabled:text-white/25 text-white font-bold text-sm transition-colors"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Memproses...
                        </span>
                      ) : (
                        "Daftar & Lanjut Bayar"
                      )}
                    </button>

                    <p className="text-[10px] text-white/25 text-center">
                      Identitas akun Anda akan digunakan sebagai perwakilan tim.
                    </p>
                  </div>
                </form>
              </section>
            )}

            {paymentData && (
              <div ref={paymentRef}>
                <PaymentResult
                  paymentData={paymentData}
                  paymentMethod={paymentMethod}
                  event={event}
                  namaTim={namaTim}
                  paymentStatus={paymentStatus}
                  onClose={() => {
                    setPaymentData(null);
                    setShowForm(false);
                  }}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}