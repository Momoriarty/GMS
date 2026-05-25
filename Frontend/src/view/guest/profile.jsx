import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  CalendarCheck,
  Trophy,
  Sparkles,
  AtSign,
  BadgeCheck,
  BadgeX,
  Phone,
  Clock,
  Hash,
  ShieldCheck,
  Ticket,
  BookOpen,
} from "lucide-react";

export default function Profile() {
  // Neutral default user data (no hardcoded personal/sample values)
  const user = {
    id: null,
    full_name: "Pengguna",
    role: "",
    email: "",
    username: "",
    phone_number: "",
    email_verified_at: null,
    password: "",
    status: "",
    avatar: null,
    remember_token: null,
    created_at: null,
    updated_at: null,
    location: "",
    interest: "",
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

  const initials = user.full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isEmailVerified = !!user.email_verified_at;

  return (
    <div className="min-h-screen bg-[#0b142d] text-white">
      <div className="relative overflow-hidden pb-24">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-16">
          <div className="rounded-3xl border border-white/5 bg-slate-950/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    className="h-24 w-24 rounded-[28px] object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-500 to-orange-500 text-4xl font-extrabold text-slate-950 shadow-xl">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm uppercase tracking-[0.26em] text-blue-300/80">
                      Profil Peserta
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isEmailVerified
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {isEmailVerified ? (
                        <BadgeCheck size={12} />
                      ) : (
                        <BadgeX size={12} />
                      )}
                      {isEmailVerified ? "Terverifikasi" : "Belum Diverifikasi"}
                    </span>
                  </div>
                  <h1 className="mt-4 text-3xl font-bold text-white">
                    Halo, {user.full_name}!
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    @{user.username} · #{user.id}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    Lihat ringkasan informasi akun, riwayat pendaftaran, dan
                    rekomendasi event terbaru yang cocok untukmu.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/event"
                  className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-400"
                >
                  Telusuri Event
                </Link>
                <Link
                  to="/my-registrations"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:text-blue-300"
                >
                  Pendaftaran Saya
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Informasi Akun */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-slate-900 p-8 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Informasi Akun
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-white">
                    Detail kontak dan preferensi
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 rounded-3xl bg-slate-800 px-4 py-2 text-sm font-semibold text-blue-300">
                  <ShieldCheck size={14} />
                  {user.role}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* Email */}
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                      <Mail size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Email</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                      <AtSign size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Username
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
                      <Phone size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Telepon
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {user.phone_number}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Lokasi</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {user.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Sejak */}
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                      <CalendarCheck size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Member Sejak
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Minat */}
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Minat</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {user.interest}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamp Sistem */}
            <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Riwayat Akun
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Hash size={12} />
                    <p className="text-xs uppercase tracking-[0.2em]">
                      ID Peserta
                    </p>
                  </div>
                  <p className="mt-2 text-lg font-bold text-white">
                    #{user.id}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CalendarCheck size={12} />
                    <p className="text-xs uppercase tracking-[0.2em]">Dibuat</p>
                  </div>
                  <p className="mt-2 text-sm font-bold text-white">
                    {formatDateTime(user.created_at)}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={12} />
                    <p className="text-xs uppercase tracking-[0.2em]">
                      Diperbarui
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-bold text-white">
                    {formatDateTime(user.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Statistik Peserta */}
            <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Statistik
              </p>
              <h3 className="mt-3 text-lg font-bold text-white">
                Aktivitas sebagai peserta
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-slate-950/80 p-4 text-center">
                  <Ticket size={18} className="mx-auto text-blue-300" />
                  <p className="mt-2 text-2xl font-extrabold text-white">5</p>
                  <p className="text-xs text-slate-500">Event Diikuti</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-center">
                  <Trophy size={18} className="mx-auto text-orange-300" />
                  <p className="mt-2 text-2xl font-extrabold text-white">2</p>
                  <p className="text-xs text-slate-500">Prestasi</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-center">
                  <BookOpen size={18} className="mx-auto text-emerald-300" />
                  <p className="mt-2 text-2xl font-extrabold text-white">3</p>
                  <p className="text-xs text-slate-500">Disimpan</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-center">
                  <Sparkles size={18} className="mx-auto text-violet-300" />
                  <p className="mt-2 text-2xl font-extrabold text-white">12</p>
                  <p className="text-xs text-slate-500">Dilihat</p>
                </div>
              </div>
            </div>

            {/* Rekomendasi Event */}
            <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                  <Trophy size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Rekomendasi Event
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Event yang cocok berdasarkan minatmu.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-950/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">
                      Liga Garuda Futsal 2025
                    </p>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300">
                      Segera
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Gabung sekarang dan dapatkan diskon pendaftaran.
                  </p>
                  <Link
                    to="/event/liga-garuda-futsal-2025"
                    className="mt-3 inline-flex text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Daftar sekarang →
                  </Link>
                </div>
                <div className="rounded-3xl bg-slate-950/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">Open Cup Pelajar</p>
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-semibold text-orange-300">
                      Populer
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Pilihan tepat untuk tim sekolah dan komunitas.
                  </p>
                  <Link
                    to="/event/open-cup-pelajar"
                    className="mt-3 inline-flex text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Daftar sekarang →
                  </Link>
                </div>
              </div>
            </div>

            {/* Status Akun */}
            <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Status Akun
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-950/80 px-4 py-3">
                  <span className="text-sm text-slate-400">Status</span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {user.status}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-950/80 px-4 py-3">
                  <span className="text-sm text-slate-400">
                    Verifikasi Email
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isEmailVerified
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    {isEmailVerified ? "Terverifikasi" : "Belum"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-950/80 px-4 py-3">
                  <span className="text-sm text-slate-400">Role</span>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
