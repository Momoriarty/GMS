function AdminDashboard() {
    const stats = [
        { label: "Total Event", value: "24", sub: "+3 bulan ini", icon: "❓", color: "bg-blue-500" },
        { label: "Total Peserta", value: "1,240", sub: "+87 minggu ini", icon: "👥", color: "bg-blue-400" },
        { label: "Pendaftaran Pending", value: "15", sub: "Perlu ditinjau", icon: "⏰", color: "bg-orange-400" },
        { label: "Event Aktif", value: "8", sub: "Sedang berjalan", icon: "▶️", color: "bg-green-500" },
    ];

    const pendaftaran = [
        { nama: "Reza Firmansyah", email: "reza.f@email.com", tim: "FC Garuda Muda", event: "Liga Garuda Futsal Championship 2025", kategori: "Futsal", status: "Pending" },
        { nama: "Siti Rahayu", email: "siti.r@email.com", tim: "SSB Melayu Jaya", event: "Piala Garuda Junior SSB 2025", kategori: "SSB", status: "Approved" },
        { nama: "Budi Santoso", email: "budi.s@email.com", tim: "Tim Perkasa FC", event: "Melayu Open Futsal Cup Antar Daerah", kategori: "Futsal", status: "Pending" },
        { nama: "Dewi Anggraini", email: "dewi.a@email.com", tim: "Akademi Melayu SSB", event: "Turnamen SSB U-17 Piala Melayu", kategori: "SSB", status: "Approved" },
        { nama: "Andi Kurniawan", email: "andi.k@email.com", tim: "Garuda United FC", event: "Championship Antar Daerah 2025", kategori: "Futsal", status: "Pending" },
        { nama: "Ahmad Fauzi", email: "ahmad.f@email.com", tim: "Riau Putra SSB", event: "Piala Garuda Junior SSB 2025", kategori: "SSB", status: "Pending" },
    ];

    return (
        <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-slate-100">
                        <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-xl shrink-0`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
                            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{s.value}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h2 className="font-bold text-slate-800 text-base">Statistik Peserta per Event</h2>
                        <p className="text-xs text-slate-400 mt-0.5">5 event terakhir yang diselenggarakan</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-slate-800 inline-block" /> Futsal
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-blue-300 inline-block" /> SSB
                        </span>
                    </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end gap-4 mt-6 h-48">
                    {[
                        { label: "Liga Garuda Futsal Cup", futsal: 175, ssb: 0 },
                        { label: "Piala Garuda Junior SSB", futsal: 0, ssb: 145 },
                        { label: "Melayu Open Futsal Cup", futsal: 205, ssb: 0 },
                        { label: "Turnamen SSB U-17", futsal: 0, ssb: 160 },
                        { label: "Championship Antar Daerah", futsal: 190, ssb: 0 },
                    ].map((d, i) => {
                        const max = 220;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-end justify-center gap-1" style={{ height: "160px" }}>
                                    {d.futsal > 0 && (
                                        <div
                                            className="w-full bg-slate-800 rounded-t-md"
                                            style={{ height: `${(d.futsal / max) * 100}%` }}
                                        />
                                    )}
                                    {d.ssb > 0 && (
                                        <div
                                            className="w-full bg-blue-300 rounded-t-md"
                                            style={{ height: `${(d.ssb / max) * 100}%` }}
                                        />
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 text-center leading-tight">{d.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pendaftaran Terbaru */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-slate-800 text-base">Pendaftaran Terbaru</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Daftar pendaftaran yang masuk baru-baru ini</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Cari pendaftaran..."
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                        />
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition font-medium">
                            📄 Export PDF
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition font-medium">
                            📊 Export Excel
                        </button>
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Nama</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Tim</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Event</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Kategori</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendaftaran.map((p, i) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {p.nama.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-700 text-[13px]">{p.nama}</p>
                                            <p className="text-slate-400 text-[11px]">{p.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-slate-600 text-[13px]">{p.tim}</td>
                                <td className="py-3 px-3 text-slate-600 text-[13px] max-w-[180px]">{p.event}</td>
                                <td className="py-3 px-3">
                                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                        p.kategori === "Futsal"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-sky-100 text-sky-600"
                                    }`}>
                                        {p.kategori}
                                    </span>
                                </td>
                                <td className="py-3 px-3">
                                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                        p.status === "Approved"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-orange-100 text-orange-500"
                                    }`}>
                                        {p.status === "Approved" ? "✓ Approved" : "⏳ Pending"}
                                    </span>
                                </td>
                                <td className="py-3 px-3">
                                    {p.status === "Pending" ? (
                                        <div className="flex items-center gap-1.5">
                                            <button className="px-2.5 py-1 bg-green-500 text-white text-[11px] font-semibold rounded-lg hover:bg-green-600 transition cursor-pointer">
                                                ✓ Approve
                                            </button>
                                            <button className="px-2.5 py-1 bg-red-100 text-red-500 text-[11px] font-semibold rounded-lg hover:bg-red-200 transition cursor-pointer">
                                                ✕ Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-lg hover:bg-slate-200 transition cursor-pointer">
                                            👁 Detail
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">Menampilkan 6 dari 15 pendaftaran pending</p>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 text-sm flex items-center justify-center transition cursor-pointer">‹</button>
                        {[1, 2, 3].map((n) => (
                            <button
                                key={n}
                                className={`w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center transition cursor-pointer ${
                                    n === 1
                                        ? "bg-slate-800 text-white"
                                        : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 text-sm flex items-center justify-center transition cursor-pointer">›</button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default AdminDashboard;