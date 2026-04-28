import React from 'react';

const Dashboard = () => {
  // Data statistik untuk kartu atas
  const stats = [
    { label: 'TOTAL EVENT', value: '24', color: 'text-blue-600', bg: 'bg-blue-50', icon: '🏆', trend: '+2 bulan ini' },
    { label: 'TOTAL PESERTA', value: '1,240', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '👥', trend: '+57 minggu ini' },
    { label: 'PENDAFTARAN PENDING', value: '15', color: 'text-orange-600', bg: 'bg-orange-50', icon: '⏳', trend: 'Perlu ditinjau' },
    { label: 'EVENT AKTIF', value: '8', color: 'text-green-600', bg: 'bg-green-50', icon: '⚽', trend: 'Sedang berjalan' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Ringkas (Opsional jika Header.jsx sudah ada, tapi bagus untuk konteks) */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Ringkasan Data</h2>
        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black mt-1 text-slate-800">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} text-2xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Table Area (Kiri) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Pendaftaran Terbaru</h3>
              <p className="text-xs text-slate-400">Update pendaftaran masuk hari ini</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
               <button className="flex-1 sm:flex-none px-4 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-600 hover:bg-slate-50 transition">
                 Export PDF
               </button>
               <button className="flex-1 sm:flex-none px-4 py-2 text-xs bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200 transition">
                 Export Excel
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-50">
                  <th className="pb-4 font-semibold uppercase tracking-tighter">Nama Peserta</th>
                  <th className="pb-4 font-semibold uppercase tracking-tighter">Tim</th>
                  <th className="pb-4 font-semibold uppercase tracking-tighter">Status</th>
                  <th className="pb-4 font-semibold uppercase tracking-tighter text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { nama: "Reza Firmansyah", tim: "FC Garuda Muda", status: "Pending" },
                  { nama: "Budi Santoso", tim: "Pekanbaru United", status: "Pending" },
                  { nama: "Andi Wijaya", tim: "Melayu Futsal", status: "Pending" },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4">
                      <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.nama}</p>
                      <p className="text-[10px] text-slate-400">ID: #GM2025-00{i+1}</p>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{item.tim}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5 animate-pulse"></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                          <span className="font-bold">Approve</span>
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition" title="Reject">
                          <span className="font-bold">Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Area (Kanan) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
           <h3 className="font-bold text-slate-800 text-lg mb-1">Statistik Peserta</h3>
           <p className="text-xs text-slate-400 mb-6">Grafik pertumbuhan pendaftar</p>

           <div className="flex-1 min-h-[250px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
             <div className="text-4xl animate-bounce">📊</div>
             <p className="font-medium">Integrasi Chart.js</p>
             <p className="text-[10px] text-center px-4">Siap untuk dihubungkan ke database API</p>
           </div>

           <div className="mt-6 pt-6 border-t border-slate-50">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500 font-medium">Target Kuota</span>
                <span className="text-blue-600 font-bold text-right">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-[85%] shadow-sm shadow-blue-200"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// WAJIB: Pastikan export default ini ada di baris terakhir!
export default Dashboard;
