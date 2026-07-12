import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../helpers";
import { TabLoading } from "./SharedComponents";

export default function QrisSettingsTab() {
  const [currentPayload, setCurrentPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [decodedPayload, setDecodedPayload] = useState(null);

  const fetchCurrent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/qris/settings`, authHeaders());
      setCurrentPayload(res.data?.data?.static_payload || null);
    } catch (err) {
      console.error("QRIS settings load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setDecodedPayload(null);

    try {
      // Preview gambar
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Decode QR dari gambar pakai qr-scanner (CDN)
      const QrScanner = (await import("https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.min.js")).default;
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      const payload = result?.data;

      if (!payload) {
        setMessage({ type: "error", text: "Gagal membaca QR code dari gambar. Pastikan gambar QRIS jelas dan tidak buram." });
        setUploading(false);
        return;
      }

      setDecodedPayload(payload);

      // Simpan ke backend
      await axios.post(`${API_BASE}/admin/qris/settings`, { static_payload: payload }, authHeaders());
      setCurrentPayload(payload);
      setMessage({ type: "success", text: "QRIS berhasil disimpan! Semua pembayaran QRIS sekarang akan menggunakan QRIS milikmu." });
    } catch (err) {
      console.error("QRIS upload failed", err);
      if (err?.message?.includes("No QR code found")) {
        setMessage({ type: "error", text: "Tidak ditemukan QR code dalam gambar. Pastikan gambar berisi QRIS yang valid." });
      } else {
        setMessage({ type: "error", text: "Gagal memproses gambar QRIS: " + (err?.message || "Unknown error") });
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-6">
      <div className="no-print border-b border-base-content/5 pb-4">
        <h3 className="font-extrabold text-[18px] text-base-content/90 flex items-center gap-2">
          <span>⚙️</span> Pengaturan QRIS Merchant (Manual)
        </h3>
        <p className="text-xs text-base-content/40 mt-1">
          Bypass gateway otomatis (seperti Midtrans) dengan QRIS milikmu sendiri untuk memotong biaya transaksi hingga 0%!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Visual Stand QRIS */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-base-300/10 rounded-3xl p-6 border border-base-content/5 relative min-h-[380px]">
          {currentPayload ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                ● QRIS Aktif & Siap Pakai
              </span>
              
              {/* Desain Premium Akrilik QRIS Stand ala Bank Indonesia */}
              <div className="relative bg-white rounded-3xl p-3 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.15)] w-[240px] overflow-hidden transform hover:scale-[1.03] transition-all duration-500 border border-gray-100 group">
                {/* Red Header (Official QRIS Red) */}
                <div className="bg-[#ED1B24] rounded-[18px] px-4 py-3.5 text-center relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[18px]"></div>
                  <h2 className="text-white font-black text-2xl tracking-[0.25em] italic drop-shadow-md" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    QRIS
                  </h2>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25 z-0 pointer-events-none"></div>

                <div className="relative z-10 bg-white">
                  {/* Merchant Name section */}
                  <div className="text-center mt-4 mb-3 px-2">
                    <p className="text-[14px] font-black text-slate-800 uppercase tracking-widest leading-tight truncate">
                      {(() => {
                        let i = 0;
                        while (i + 4 <= currentPayload.length) {
                          const tag = currentPayload.slice(i, i + 2);
                          const len = parseInt(currentPayload.slice(i + 2, i + 4), 10);
                          if (i + 4 + len > currentPayload.length) break;
                          if (tag === '59') return currentPayload.slice(i + 4, i + 4 + len);
                          i += 4 + len;
                        }
                        return "Nama Merchant";
                      })()}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className="h-[1px] w-6 bg-gray-200"></span>
                      <p className="text-[7.5px] text-gray-400 font-bold uppercase tracking-widest">
                        GMS Futsal Gateway
                      </p>
                      <span className="h-[1px] w-6 bg-gray-200"></span>
                    </div>
                  </div>
                  
                  {/* QR Code Container */}
                  <div className="bg-white p-2.5 border-2 border-dashed border-gray-150 rounded-xl mx-2 relative shadow-inner">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(currentPayload)}`}
                      alt="QRIS Aktif"
                      className="w-full aspect-square object-contain mx-auto mix-blend-multiply"
                    />
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#ED1B24] opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity rounded-full shadow-[0_0_6px_#ED1B24]"></div>
                  </div>
                  
                  {/* Footer Text */}
                  <div className="mt-4 mb-1 text-center">
                     <p className="text-[7.5px] font-medium text-gray-400 tracking-wider">
                       GPN • Didukung Semua E-Wallet & Bank
                     </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center text-4xl mx-auto shadow-inner border border-base-content/5 opacity-50">
                🖼️
              </div>
              <div>
                <p className="font-semibold text-xs text-base-content/50 uppercase tracking-widest">Belum Ada QRIS</p>
                <p className="text-[11px] text-base-content/40 max-w-[200px] mx-auto mt-1">
                  Upload QRIS statis dari GoPay/Shopee/Bank di sebelah kanan untuk melihat visual stand di sini.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Pengaturan & Upload */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status Alert */}
          <div className={`p-4 rounded-2xl border flex gap-3 ${currentPayload ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/5 border-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
            <span className="text-lg leading-none">{currentPayload ? "✅" : "⚠️"}</span>
            <div className="space-y-1">
              <h5 className="font-bold text-xs uppercase tracking-wider">
                {currentPayload ? "Mode QRIS Custom Aktif" : "Mode Midtrans Default"}
              </h5>
              <p className="text-[11px] text-base-content/50 leading-relaxed">
                {currentPayload 
                  ? "Sistem mendeteksi QRIS manual. Pembayaran oleh peserta sekarang akan dilewatkan ke QRIS ini dengan nominal yang otomatis disesuaikan secara dinamis."
                  : "Belum ada QRIS custom yang diupload. Pembayaran QRIS saat ini masih menggunakan Midtrans Core API secara default."}
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="rounded-2xl p-5 bg-base-200 border border-base-content/5 space-y-4">
            <div>
              <h4 className="font-extrabold text-[13px] uppercase tracking-wider text-base-content/75">Unggah QRIS Baru</h4>
              <p className="text-[11px] text-base-content/45 mt-0.5">
                Pastikan gambar QRIS memiliki kualitas yang baik dan kode QR tidak terpotong.
              </p>
            </div>

            <label className={`relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? "border-amber-500/50 bg-amber-500/5" : "border-base-content/10 bg-base-300/20 hover:border-warning/30 hover:bg-warning/5"}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="loading loading-spinner loading-md text-warning" />
                  <span className="text-xs text-base-content/50">Memindai gambar & mendekode payload...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-center px-4">
                  <span className="text-2xl mb-1">📸</span>
                  <span className="text-xs font-bold text-base-content/70">Klik untuk Pilih Gambar</span>
                  <span className="text-[10px] text-base-content/40">Tarik gambar QRIS statis ke sini (PNG, JPG, JPEG)</span>
                </div>
              )}
            </label>

            {/* Preview & Hasil Decoding */}
            {previewUrl && (
              <div className="mt-4 p-3 rounded-xl bg-base-300/50 border border-base-content/5 flex flex-col sm:flex-row gap-4 items-center">
                <div className="rounded-xl overflow-hidden bg-white p-1.5 flex-shrink-0 border border-base-content/10 shadow-sm">
                  <img src={previewUrl} alt="QRIS Preview" className="w-24 h-24 object-contain" />
                </div>
                {decodedPayload ? (
                  <div className="flex-1 space-y-1.5 w-full">
                    <p className="text-[11px] font-extrabold text-emerald-500 flex items-center gap-1">
                      <span>✓</span> QRIS Berhasil Terbaca!
                    </p>
                    <div className="text-[10px] text-base-content/50 bg-base-200 rounded-lg p-2 font-mono break-all max-h-16 overflow-y-auto w-full shadow-inner border border-base-content/5">
                      {decodedPayload}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-red-400 font-semibold">
                    ❌ Gagal membaca kode QR. Coba ganti gambar yang lebih jelas.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Developer / Raw Data */}
          {currentPayload && (
            <div className="rounded-2xl p-4 bg-base-200 border border-base-content/5">
              <details className="w-full">
                <summary className="text-[11px] text-base-content/40 cursor-pointer hover:text-base-content/60 transition font-bold uppercase tracking-wider">
                  Raw Payload & Metadata QRIS
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="text-[10px] text-base-content/50 bg-base-300/50 rounded-xl p-3 font-mono break-all max-h-20 overflow-y-auto w-full shadow-inner border border-base-content/5">
                    {currentPayload}
                  </div>
                  <p className="text-[9px] text-base-content/30 leading-relaxed">
                    Data di atas adalah raw EMVCo string hasil dekode QRIS statismu. Payload ini digunakan untuk men-generate nominal secara dinamis di sisi klien/peserta secara aman.
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* Feedback Messages */}
          {message && (
            <div className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-500"
            }`}>
              <span>{message.type === "success" ? "✅" : "❌"}</span>
              <span>{message.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-2xl p-5 bg-base-200 border border-base-content/5">
        <h4 className="font-semibold text-[13px] mb-2">ℹ️ Cara Kerja</h4>
        <ol className="text-xs text-base-content/50 space-y-1.5 list-decimal list-inside">
          <li>Admin upload gambar QRIS statis dari GoPay Merchant / aplikasi bank.</li>
          <li>Sistem membaca dan menyimpan data QRIS secara otomatis.</li>
          <li>Saat pendaftar memilih bayar via QRIS, sistem menyisipkan nominal dan ID pendaftaran ke QRIS-mu.</li>
          <li>Pendaftar scan QRIS yang sudah include nominal, langsung bayar ke rekening/akun-mu.</li>
          <li>Konfirmasi pembayaran bisa dilakukan otomatis via webhook GoPay atau manual oleh admin.</li>
        </ol>
      </div>
    </div>
  );
}
