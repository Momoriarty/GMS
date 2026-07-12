import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const API_BASE = "http://localhost:8000/api";

export const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export const PAGE_SIZE = 8;
export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3, CURRENT_YEAR - 4];

export const emptyForm = {
  jenis: "pemasukan",
  kategori: "",
  nominal: "",
  metode_pembayaran: "Tunai",
  tanggal_transaksi: new Date().toISOString().slice(0, 10),
  keterangan: "",
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

export const formatCurrencyShort = (value) => {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return `${v}`;
};

export const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return value;
  }
};

export const downloadCsv = (filename, header, rows) => {
  const csv = [header, ...rows].map((r) => r.map((v) => `${v ?? ""}`.replace(/,/g, " ")).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const handleExportExcel = (transactions, periodName) => {
  const data = transactions.map((t) => ({
    Tanggal: formatDate(t.tanggal_transaksi),
    Jenis: t.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran",
    Kategori: t.kategori || "-",
    "Metode Pembayaran": t.metode_pembayaran || "-",
    Keterangan: t.keterangan || "-",
    Nominal: t.nominal,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
  XLSX.writeFile(workbook, `Laporan_Keuangan_${periodName.replace(/\s+/g, "_")}.xlsx`);
};

export const handleExportPdf = (transactions, summary, periodName) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Laporan Keuangan Garuda Melayu Futsal", 14, 20);
  doc.setFontSize(12);
  doc.text(`Periode: ${periodName}`, 14, 28);
  
  doc.setFontSize(10);
  doc.text(`Total Pemasukan: ${formatCurrency(summary.total_pemasukan)}`, 14, 38);
  doc.text(`Total Pengeluaran: ${formatCurrency(summary.total_pengeluaran)}`, 14, 44);
  doc.text(`Saldo Akhir: ${formatCurrency(summary.saldo)}`, 14, 50);

  const tableColumn = ["Tanggal", "Jenis", "Kategori", "Metode", "Keterangan", "Nominal"];
  const tableRows = transactions.map((t) => [
    formatDate(t.tanggal_transaksi),
    t.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran",
    t.kategori || "-",
    t.metode_pembayaran || "-",
    t.keterangan || "-",
    formatCurrency(t.nominal),
  ]);

  doc.autoTable({
    startY: 56,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [245, 158, 11] },
  });

  doc.save(`Laporan_Keuangan_${periodName.replace(/\s+/g, "_")}.pdf`);
};

export const handleExportAnnualExcel = (bulanan, totalData, tahun) => {
  const data = bulanan.map((b) => ({
    Bulan: b.label,
    Pemasukan: b.pemasukan,
    Pengeluaran: b.pengeluaran,
    Saldo: b.saldo,
  }));
  data.push({
    Bulan: "TOTAL",
    Pemasukan: totalData.total_pemasukan,
    Pengeluaran: totalData.total_pengeluaran,
    Saldo: totalData.saldo_akhir,
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tahunan");
  XLSX.writeFile(workbook, `Laporan_Tahunan_${tahun}.xlsx`);
};

export const handleExportAnnualPdf = (bulanan, totalData, tahun) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Laporan Tahunan Keuangan Garuda Melayu Futsal", 14, 20);
  doc.setFontSize(12);
  doc.text(`Tahun: ${tahun}`, 14, 28);
  
  doc.setFontSize(10);
  doc.text(`Total Pemasukan: ${formatCurrency(totalData.total_pemasukan)}`, 14, 38);
  doc.text(`Total Pengeluaran: ${formatCurrency(totalData.total_pengeluaran)}`, 14, 44);
  doc.text(`Saldo Akhir: ${formatCurrency(totalData.saldo_akhir)}`, 14, 50);

  const tableColumn = ["Bulan", "Pemasukan", "Pengeluaran", "Saldo"];
  const tableRows = bulanan.map((b) => [
    b.label,
    formatCurrency(b.pemasukan),
    formatCurrency(b.pengeluaran),
    formatCurrency(b.saldo),
  ]);
  tableRows.push([
    "TOTAL",
    formatCurrency(totalData.total_pemasukan),
    formatCurrency(totalData.total_pengeluaran),
    formatCurrency(totalData.saldo_akhir),
  ]);

  doc.autoTable({
    startY: 56,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [245, 158, 11] },
  });

  doc.save(`Laporan_Tahunan_${tahun}.pdf`);
};

export const authHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const TABS = [
  { key: "bulanan", label: "Ringkasan Bulanan" },
  { key: "perbandingan", label: "Perbandingan Tahun" },
  { key: "event", label: "Per Event" },
  { key: "proyeksi", label: "Proyeksi Kas" },
  { key: "tahunan", label: "Laporan Tahunan" },
  { key: "budget", label: "Budget vs Realisasi" },
  { key: "qris", label: "⚙ QRIS" },
];
