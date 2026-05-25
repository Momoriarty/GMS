import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Settings,
  AtSign,
  BadgeCheck,
  BadgeX,
  Hash,
  User,
} from "lucide-react";

export default function Profile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500 text-sm">
        Memuat profil...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-sm">
        Gagal memuat profil.
      </div>
    );
  }

  const initials = admin.name
    ? admin.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "--";

  const isEmailVerified = !!admin.email_verified_at;

  return (
    <section className="min-h-full py-2">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
            Profil Admin
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">
            {admin.name}
          </h1>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#263348] border border-[#2d3f55] text-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150"
        >
          <Settings size={15} />
          Edit Profil
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[272px_1fr]">
        {/* Sidebar */}
        <div className="space-y-3">
          {/* Avatar + nama */}
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-xl p-5">
            <div className="flex items-center gap-4">
              {admin.avatar ? (
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1e2d3d] text-base font-semibold text-slate-200 shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 truncate">
                  {admin.name}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  @{admin.username || "user"}
                </p>
                <span className="inline-block mt-2 text-xs font-medium bg-[#1e2d3d] text-slate-400 px-2 py-0.5 rounded">
                  {admin.role}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-xl p-5">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mb-4">
              Status
            </p>

            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e2d3d] text-slate-500 shrink-0">
                <ShieldCheck size={15} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {admin.status}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">Akun aktif</p>
              </div>
            </div>

            <div className="border-t border-[#1e2d3d] pt-4 flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                  isEmailVerified
                    ? "bg-emerald-950/60 text-emerald-500"
                    : "bg-red-950/60 text-red-500"
                }`}
              >
                {isEmailVerified ? (
                  <BadgeCheck size={15} />
                ) : (
                  <BadgeX size={15} />
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {isEmailVerified
                    ? "Email terverifikasi"
                    : "Belum diverifikasi"}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isEmailVerified
                    ? formatDate(admin.email_verified_at)
                    : "Verifikasi email diperlukan"}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-xl p-5">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mb-4">
              Info
            </p>
            <div className="space-y-3">
              <InfoRow
                icon={<Hash size={13} />}
                label="ID User"
                value={`#${admin.id}`}
              />
              <InfoRow
                icon={<CalendarDays size={13} />}
                label="Bergabung"
                value={formatDate(admin.created_at)}
              />
              <InfoRow
                icon={<User size={13} />}
                label="Role"
                value={admin.role}
              />
            </div>
          </div>
        </div>

        {/* Konten utama */}
        <div className="space-y-4">
          {/* Detail kontak */}
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-xl p-5">
            <div className="mb-5">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mb-1">
                Informasi Akun
              </p>
              <h2 className="text-base font-semibold text-slate-100">
                Detail Kontak
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ContactField
                icon={<Mail size={14} />}
                label="Email"
                value={admin.email}
                sub="Kontak resmi admin"
              />
              <ContactField
                icon={<AtSign size={14} />}
                label="Username"
                value={`@${admin.username || "user"}`}
                sub="Nama pengguna unik"
              />
              <ContactField
                icon={<Phone size={14} />}
                label="Telepon"
                value={admin.phone_number || "—"}
              />
              <ContactField
                icon={<MapPin size={14} />}
                label="Alamat"
                value={admin.address || "—"}
              />
            </div>
          </div>

          {/* Riwayat akun */}
          <div className="bg-[#111827] border border-[#1e2d3d] rounded-xl p-5">
            <div className="mb-5">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mb-1">
                Riwayat Akun
              </p>
              <h2 className="text-base font-semibold text-slate-100">
                Aktivitas
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TimestampCard
                label="Dibuat"
                value={formatDateTime(admin.created_at)}
              />
              <TimestampCard
                label="Diperbarui"
                value={formatDateTime(admin.updated_at)}
              />
              <TimestampCard
                label="Verifikasi Email"
                value={
                  isEmailVerified
                    ? formatDateTime(admin.email_verified_at)
                    : "—"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-slate-600">
        {icon}
        {label}
      </span>
      <span className="text-slate-300 font-medium">{value}</span>
    </div>
  );
}

function ContactField({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-3 bg-[#0f172a] rounded-lg px-4 py-3.5 border border-[#1e2d3d]">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e2d3d] text-slate-500 shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-600 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-200 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function TimestampCard({ label, value }) {
  return (
    <div className="bg-[#0f172a] rounded-lg px-4 py-3.5 border border-[#1e2d3d]">
      <p className="text-xs text-slate-600 mb-1.5">{label}</p>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}
