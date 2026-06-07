import { useState } from "react";

export default function Klasemen() {
  const [klasemen, setKlasemen] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Klasemen</h1>
        <p className="text-slate-400 mt-2">Peringkat tim berdasarkan hasil pertandingan</p>
      </div>

      {/* Filter */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Pilih Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Semua Event --</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Posisi
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Nama Tim
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                Main
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                Menang
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                Seri
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                Kalah
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                Gol
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                Poin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {klasemen.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data klasemen
                </td>
              </tr>
            ) : (
              klasemen.map((k, index) => (
                <tr key={k.id} className="hover:bg-slate-700/50 transition">
                  <td className="px-6 py-3 text-white font-bold">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-white font-medium">{k.nama_tim}</td>
                  <td className="px-6 py-3 text-center text-slate-300">{k.main}</td>
                  <td className="px-6 py-3 text-center text-green-400 font-medium">
                    {k.menang}
                  </td>
                  <td className="px-6 py-3 text-center text-slate-300">{k.seri}</td>
                  <td className="px-6 py-3 text-center text-red-400 font-medium">
                    {k.kalah}
                  </td>
                  <td className="px-6 py-3 text-center text-slate-300">
                    {k.gol_masuk} - {k.gol_kemasukan}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="text-lg font-bold text-yellow-400">{k.poin}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-sm text-slate-400">
        <p>Sistem Poin: Menang = 3 poin, Seri = 1 poin, Kalah = 0 poin</p>
      </div>
    </div>
  );
}
