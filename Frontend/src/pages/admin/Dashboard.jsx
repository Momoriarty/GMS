import React from 'react';
import {
    LayoutDashboard, Calendar, Users, FileText, Settings,
    Bell, Search, Check, X, Eye, TrendingUp
} from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-700">

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#1e293b] text-slate-300 p-6 flex flex-col sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-white p-2 rounded-lg font-bold text-[#1e293b]">GM</div>
                    <div>
                        <h1 className="font-bold text-white">Garuda Melayu</h1>
                        <span className="text-xs text-slate-400">FUTSAL & SSB</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Menu</p>

                    <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
                    <NavItem icon={<Calendar size={18} />} label="Kelola Event" />
                    <NavItem icon={<Users size={18} />} label="Peserta" badge="15" />
                    <NavItem icon={<FileText size={18} />} label="Jadwal" />

                    <p className="mt-8 mb-3 text-xs font-semibold uppercase text-slate-500">Sistem</p>

                    <NavItem icon={<Bell size={18} />} label="Notifikasi" badge="3" />
                    <NavItem icon={<Settings size={18} />} label="Setting" />
                </nav>
            </aside>

            {/* MAIN */}
            <main className="flex-1 p-6 md:p-8">

                {/* HEADER */}
                <header className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                        <p className="text-sm text-slate-500">Selamat datang kembali, Admin</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 text-sm bg-white rounded-lg shadow">
                            26 April 2026
                        </div>

                        <div className="relative p-2 bg-white rounded-lg shadow">
                            <Bell size={18} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                                3
                            </span>
                        </div>
                    </div>
                </header>

                {/* STATS */}
                <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard title="TOTAL EVENT" value="24" trend="+3 bulan ini" color="bg-indigo-600" />
                    <StatCard title="TOTAL PESERTA" value="1,240" trend="+87 minggu ini" color="bg-blue-500" />
                    <StatCard title="PENDING" value="15" trend="Perlu review" color="bg-orange-500" warning />
                    <StatCard title="EVENT AKTIF" value="8" trend="Berjalan" color="bg-green-500" success />

                </div>

                {/* TABLE */}
                <div className="overflow-hidden bg-white border shadow rounded-xl">

                    {/* TOP BAR */}
                    <div className="flex flex-col gap-3 p-5 border-b md:flex-row md:justify-between md:items-center">
                        <div>
                            <h3 className="text-lg font-bold">Pendaftaran Terbaru</h3>
                            <p className="text-sm text-slate-500">Data masuk terbaru</p>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    className="py-2 pr-3 text-sm border rounded-lg outline-none pl-9 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Cari..."
                                />
                            </div>

                            <button className="px-4 py-2 text-sm text-white rounded-lg bg-slate-800">
                                Export
                            </button>
                        </div>
                    </div>

                    {/* TABLE WRAPPER */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm">

                            <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-4 text-left">Nama</th>
                                    <th className="p-4 text-left">Tim</th>
                                    <th className="p-4 text-left">Event</th>
                                    <th className="p-4 text-left">Kategori</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                <TableRow
                                    name="Reza Firmansyah"
                                    email="reza@email.com"
                                    tim="FC Garuda"
                                    event="Liga Futsal 2025"
                                    cat="Futsal"
                                    status="Pending"
                                />

                                <TableRow
                                    name="Siti Rahayu"
                                    email="siti@email.com"
                                    tim="SSB Melayu"
                                    event="Piala Junior"
                                    cat="SSB"
                                    status="Approved"
                                />

                            </tbody>

                        </table>
                    </div>

                </div>

            </main>
        </div>
    );
};

export default Dashboard;

/* ================= COMPONENT ================= */

const NavItem = ({ icon, label, active, badge }) => (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition
        ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
        <div className="flex items-center gap-3 text-sm">
            {icon}
            <span>{label}</span>
        </div>

        {badge && (
            <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">
                {badge}
            </span>
        )}
    </div>
);

const StatCard = ({ title, value, trend, color, warning, success }) => (
    <div className="flex items-center gap-4 p-5 transition bg-white border shadow rounded-xl hover:shadow-md">

        <div className={`${color} p-3 rounded-xl text-white`}>
            <TrendingUp size={20} />
        </div>

        <div>
            <p className="text-xs font-semibold uppercase text-slate-400">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>

            <p className={`text-xs mt-1 ${warning ? 'text-orange-500' :
                success ? 'text-green-500' :
                    'text-blue-500'
                }`}>
                {trend}
            </p>
        </div>

    </div>
);

const TableRow = ({ name, email, tim, event, cat, status }) => (
    <tr className="hover:bg-slate-50">

        <td className="p-4">
            <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-slate-400">{email}</p>
            </div>
        </td>

        <td className="p-4">{tim}</td>
        <td className="p-4 text-slate-500">{event}</td>

        <td className="p-4">
            <span className="px-2 py-1 text-xs rounded bg-slate-100">
                {cat}
            </span>
        </td>

        <td className="p-4">
            <span className={`text-xs px-3 py-1 rounded-full ${status === 'Approved'
                ? 'bg-green-100 text-green-600'
                : 'bg-orange-100 text-orange-600'
                }`}>
                {status}
            </span>
        </td>

        <td className="flex gap-2 p-4">
            {status === 'Pending' ? (
                <>
                    <button className="p-1 text-white bg-green-500 rounded">
                        <Check size={14} />
                    </button>
                    <button className="p-1 text-white bg-red-500 rounded">
                        <X size={14} />
                    </button>
                </>
            ) : (
                <button className="flex items-center gap-1 px-3 py-1 text-xs border rounded">
                    <Eye size={12} /> Detail
                </button>
            )}
        </td>

    </tr>
);
