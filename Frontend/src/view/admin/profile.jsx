import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  CalendarDays,
  Settings,
  AtSign,
  BadgeCheck,
  BadgeX,
  KeyRound,
  Clock,
  Hash,
  UserCircle2,
} from "lucide-react";

export default function Profile() {
  // Neutral default admin data (no hardcoded personal/sample values)
  const admin = {
    id: null,
    full_name: "Administrator",
    role: "Admin",
    email: "",
    username: "",
    phone_number: "",
    email_verified_at: null,
    password: "",
    status: "Aktif",
    avatar: null,
    remember_token: null,
    created_at: null,
    updated_at: null,
    address: "",
    team: "",
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const initials = admin.full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isEmailVerified = !!admin.email_verified_at;

  return (
    <section className="min-h-full">
      {/* Header */}
      <div className="mb-6 rounded-4xl border border-white/5 bg-slate-950 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-amber-400/85">
              Profil Admin
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">
              Data Akun dan Informasi Pribadi
            </h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Halaman profil admin menampilkan informasi akun, status akses, dan
              ringkasan data admin dengan tema gelap modern.
            </p>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-slate-950 transition-all duration-200 hover:brightness-110"
          >
            <Settings size={16} />
            Edit Profil
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <div className="rounded-[28px] border border-white/5 bg-slate-900 p-6 shadow-xl">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            {admin.avatar ? (
              <img
                src={admin.avatar}
                alt={admin.full_name}
                className="h-20 w-20 rounded-3xl object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-amber-400 to-orange-500 text-3xl font-extrabold text-slate-950 shadow-lg">
                {initials}
              </div>
            )}
            <div>
              <p className="text-xl font-bold text-white">{admin.full_name}</p>
              <p className="mt-0.5 text-xs text-slate-500">@{admin.username}</p>
              <p className="mt-1 text-sm uppercase tracking-[0.2em] text-amber-300/90">
                {admin.role}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {/* Status Akun */}
            <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">
                Status Akun
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {admin.status}
                  </p>
                  <p className="text-xs text-slate-500">
                    Akun dapat mengakses seluruh panel admin.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Verified */}
            <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">
                Verifikasi Email
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${
                    isEmailVerified
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {isEmailVerified ? (
                    <BadgeCheck size={16} />
                  ) : (
                    <BadgeX size={16} />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {isEmailVerified ? "Terverifikasi" : "Belum Diverifikasi"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isEmailVerified
                      ? formatDate(admin.email_verified_at)
                      : "Verifikasi email diperlukan."}
                  </p>
                </div>
              </div>
            </div>

            {/* Keanggotaan */}
            <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">
                Keanggotaan
              </p>
              <div className="mt-3 grid gap-3 text-sm text-slate-100">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 p-3">
                  <CalendarDays size={16} className="text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">Bergabung</p>
                    <p className="text-slate-400">
                      {formatDate(admin.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 p-3">
                  <Sparkles size={16} className="text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">Tim</p>
                    <p className="text-slate-400">{admin.team}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 p-3">
                  <Hash size={16} className="text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">ID Pengguna</p>
                    <p className="text-slate-400">#{admin.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Informasi Kontak */}
          <div className="rounded-[28px] border border-white/5 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-400/80">
                  Informasi Akun
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  Detail kontak
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition-all duration-200 hover:bg-amber-500/15"
              >
                Lihat semua
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* Email */}
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Email
                </p>
                <div className="mt-3 flex items-center gap-3 text-slate-100">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-amber-300">
                    <Mail size={16} />
                  </span>
                  <div>
                    <p className="font-semibold">{admin.email}</p>
                    <p className="text-xs text-slate-500">Kontak resmi admin</p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Username
                </p>
                <div className="mt-3 flex items-center gap-3 text-slate-100">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-amber-300">
                    <AtSign size={16} />
                  </span>
                  <div>
                    <p className="font-semibold">@{admin.username}</p>
                    <p className="text-xs text-slate-500">Nama pengguna unik</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Telepon
                </p>
                <div className="mt-3 flex items-center gap-3 text-slate-100">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-amber-300">
                    <Phone size={16} />
                  </span>
                  <div>
                    <p className="font-semibold">{admin.phone_number}</p>
                    <p className="text-xs text-slate-500">
                      Nomor darurat admin
                    </p>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Password
                </p>
                <div className="mt-3 flex items-center gap-3 text-slate-100">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-amber-300">
                    <KeyRound size={16} />
                  </span>
                  <div>
                    <p className="font-semibold tracking-widest">
                      {admin.password}
                    </p>
                    <p className="text-xs text-slate-500">
                      Terenkripsi dan aman
                    </p>
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div className="rounded-3xl bg-slate-950/80 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Alamat
                </p>
                <div className="mt-3 flex items-center gap-3 text-slate-100">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-amber-300">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <p className="font-semibold">{admin.address}</p>
                    <p className="text-xs text-slate-500">
                      Lokasi kantor pusat admin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-[28px] border border-white/5 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400/80">
              Riwayat Akun
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Timestamp sistem
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarDays size={14} />
                  <p className="text-xs uppercase tracking-[0.25em]">Dibuat</p>
                </div>
                <p className="mt-3 text-sm font-bold text-white">
                  {formatDateTime(admin.created_at)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Waktu pendaftaran akun
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} />
                  <p className="text-xs uppercase tracking-[0.25em]">
                    Diperbarui
                  </p>
                </div>
                <p className="mt-3 text-sm font-bold text-white">
                  {formatDateTime(admin.updated_at)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pembaruan terakhir akun
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <BadgeCheck size={14} />
                  <p className="text-xs uppercase tracking-[0.25em]">
                    Verifikasi
                  </p>
                </div>
                <p className="mt-3 text-sm font-bold text-white">
                  {isEmailVerified
                    ? formatDateTime(admin.email_verified_at)
                    : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Email terverifikasi pada
                </p>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="rounded-[28px] border border-white/5 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400/80">
              Ringkasan
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              Statistik aktivitas
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Event
                </p>
                <p className="mt-4 text-3xl font-extrabold text-white">24</p>
                <p className="mt-2 text-xs text-slate-500">
                  Event aktif saat ini
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Peserta
                </p>
                <p className="mt-4 text-3xl font-extrabold text-white">1.850</p>
                <p className="mt-2 text-xs text-slate-500">
                  Total peserta terdaftar
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Approval
                </p>
                <p className="mt-4 text-3xl font-extrabold text-white">54</p>
                <p className="mt-2 text-xs text-slate-500">
                  Persetujuan terakhir
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
