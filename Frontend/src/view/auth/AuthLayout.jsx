import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

export function GarudaLogo() {
    return (
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-500 font-extrabold text-sm shrink-0 shadow-lg">
                GM
            </div>
            <div>
                <p className="text-white font-bold text-lg leading-tight">Garuda Melayu</p>
                <p className="text-slate-500 text-[11px] tracking-widest">FUTSAL & SSB</p>
            </div>
        </div>
    );
}

export function InputField({ icon: Icon, label, type = "text", placeholder, value, onChange, rightElement }) {
    return (
        <div className="mb-4">
            <label className="block text-slate-400 text-xs font-semibold mb-1.5 tracking-wide uppercase">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Icon size={16} strokeWidth={1.8} />
                </div>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
                />
                {rightElement && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
}

export function AuthCard({ children }) {
    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Left Panel — Dekoratif */}
            <div className="hidden lg:flex w-[420px] bg-slate-900 border-r border-white/5 flex-col justify-between p-10 relative overflow-hidden shrink-0">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="relative z-10">
                    <GarudaLogo />
                    <div className="mt-12">
                        <div className="w-16 h-1 bg-amber-500 rounded-full mb-6" />
                        <h2 className="text-white text-2xl font-bold leading-snug mb-3">
                            Platform Manajemen<br />Olahraga Terpadu
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Kelola pendaftaran, jadwal latihan, turnamen, dan laporan keuangan dalam satu sistem yang terintegrasi.
                        </p>
                    </div>
                    <div className="mt-10 space-y-3">
                        {["Manajemen Anggota & SSB", "Penjadwalan Lapangan", "Laporan Keuangan Real-time", "Notifikasi Otomatis"].map((f) => (
                            <div key={f} className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="text-slate-400 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-slate-700 text-xs">© 2025 Garuda Melayu. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}