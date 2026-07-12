import { useState } from "react";
import axios from "axios";
import { Database as DbIcon, Download, Upload, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Database() {
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);

  const handleBackup = async () => {
    try {
      setLoadingBackup(true);
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const res = await axios.get("http://localhost:8000/api/database/backup", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = res.headers["content-disposition"];
      let filename = `backup-gsm-${new Date().toISOString().slice(0, 10)}.sql`;
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches[1]) filename = matches[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh cadangan database.");
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const confirmFirst = window.confirm(
      "PERINGATAN KRITIS:\n\nProses pemulihan (restore) akan menghapus seluruh data aktif Anda saat ini dan menggantinya dengan data dari file cadangan.\n\nApakah Anda yakin ingin melanjutkan?"
    );

    if (!confirmFirst) {
      e.target.value = "";
      return;
    }

    try {
      setLoadingRestore(true);
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:8000/api/database/restore", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        alert("Database berhasil dipulihkan!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal memulihkan database. Pastikan file .sql valid.");
    } finally {
      setLoadingRestore(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Database</h1>
        <p className="text-base-content/60 mt-2">Amankan dan pulihkan data turnamen futsal Anda secara instan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: BACKUP */}
        <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <Download size={24} />
            </div>
            <h3 className="text-lg font-bold">Backup Database (.sql)</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Unduh cadangan seluruh data sistem termasuk data tim, pendaftaran, transaksi laporan keuangan, jadwal pertandingan, dan riwayat skor dalam format file SQL standar.
            </p>
          </div>
          <button
            onClick={handleBackup}
            disabled={loadingBackup}
            className="btn btn-warning w-full font-bold transition-all duration-200 text-xs py-3 rounded-xl disabled:opacity-50"
          >
            {loadingBackup ? (
              <span className="loading loading-spinner loading-xs mr-2"></span>
            ) : (
              <Download size={14} className="mr-2" />
            )}
            {loadingBackup ? "Mengunduh..." : "Unduh Cadangan Database"}
          </button>
        </div>

        {/* CARD 2: RESTORE */}
        <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#ff4800]/10 text-[#ff4800] flex items-center justify-center">
              <Upload size={24} />
            </div>
            <h3 className="text-lg font-bold">Restore Database</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Pulihkan database Anda dari file cadangan `.sql` yang telah diunduh sebelumnya. Seluruh tabel akan dihapus bersih dan diganti dengan isi file cadangan.
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".sql"
              onChange={handleRestore}
              disabled={loadingRestore}
              id="restore-upload"
              className="hidden"
            />
            <label
              htmlFor="restore-upload"
              className={`btn btn-outline border-white/20 hover:border-[#ff4800] w-full font-bold transition-all duration-200 text-xs py-3 rounded-xl flex items-center justify-center cursor-pointer ${
                loadingRestore ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {loadingRestore ? (
                <span className="loading loading-spinner loading-xs mr-2"></span>
              ) : (
                <Upload size={14} className="mr-2" />
              )}
              {loadingRestore ? "Memulihkan..." : "Pilih Berkas Cadangan (.sql)"}
            </label>
          </div>
        </div>
      </div>

      {/* ALERT WARNING */}
      <div className="rounded-2xl p-5 bg-red-500/10 border border-red-500/20 flex gap-4 items-start">
        <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-red-400">Peringatan Keamanan Kritis</h4>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Proses pemulihan (restore) database bersifat irreversible (tidak dapat dibatalkan). Harap pastikan file cadangan `.sql` yang Anda unggah adalah file yang valid dan tidak korup. Sebaiknya lakukan backup data aktif Anda sebelum melakukan pemulihan.
          </p>
        </div>
      </div>
    </div>
  );
}
