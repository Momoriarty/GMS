import { useState } from "react";
import { Eye, Check, X } from "lucide-react";

export default function Pendaftaran() {
  const [pendaftaran, setPendaftaran] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleVerify = (id, status) => {
    // TODO: Call API to verify pendaftaran
    console.log("Verify pendaftaran", id, "with status:", status);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Pendaftaran</h1>
        <p className="text-slate-400 mt-2">Verifikasi pendaftaran tim ke event</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">
          Semua
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300">
          Menunggu
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300">
          Diterima
        </button>
        <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300">
          Ditolak
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Nama Tim
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Event
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Tanggal Daftar
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Dokumen
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {pendaftaran.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data pendaftaran
                </td>
              </tr>
            ) : (
              pendaftaran.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/50 transition">
                  <td className="px-6 py-3 text-white font-medium">{p.nama_tim}</td>
                  <td className="px-6 py-3 text-slate-300">{p.event}</td>
                  <td className="px-6 py-3 text-slate-300">{p.tanggal_daftar}</td>
                  <td className="px-6 py-3">
                    {p.dokumen ? (
                      <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <Eye size={16} />
                        Lihat
                      </button>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        p.status === "diterima"
                          ? "bg-green-500/20 text-green-400"
                          : p.status === "ditolak"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    {p.status === "menunggu" && (
                      <>
                        <button
                          onClick={() => handleVerify(p.id, "diterima")}
                          className="p-1 hover:bg-slate-700 rounded transition text-green-400"
                          title="Terima"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleVerify(p.id, "ditolak")}
                          className="p-1 hover:bg-slate-700 rounded transition text-red-400"
                          title="Tolak"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
