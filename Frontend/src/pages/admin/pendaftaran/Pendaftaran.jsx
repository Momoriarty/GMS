import { Check, X, Eye, Phone } from "lucide-react";
import DataTable from "@/components/DataTable";
import { pendaftaranApi } from "@/data/services";

export default function Pendaftaran() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const handleVerify = async (row, status) => {
    try {
      await pendaftaranApi.verify(row.id, status);
      window.location.reload();
    } catch (error) {
      console.error("Error verifying pendaftaran:", error);
      alert("Gagal memverifikasi pendaftaran");
    }
  };

  const columns = [
    { key: "tim", label: "Nama Tim", render: (row) => row.tim?.nama_tim || "-" },
    { key: "event", label: "Event", render: (row) => row.event?.nama_event || "-" },
    { key: "tanggal_daftar", label: "Tanggal Daftar", type: "date" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      colorMap: {
        diterima: { cls: "badge-success", dot: true },
        ditolak: { cls: "badge-error", dot: true },
        menunggu: { cls: "badge-warning", dot: true },
      },
    },
  ];

  const actions = [
    {
      label: "Terima",
      icon: <Check size={14} />,
      color: "#22c55e",
      onClick: (row) => {
        if (row.status === "menunggu") handleVerify(row, "diterima");
      },
    },
    {
      label: "Tolak",
      icon: <X size={14} />,
      color: "#ef4444",
      onClick: (row) => {
        if (row.status === "menunggu") handleVerify(row, "ditolak");
      },
    },
    {
      label: "Hubungi WA",
      icon: <Phone size={14} />,
      color: "#25d366",
      onClick: (row) => {
        const phone = row.tim?.user?.no_wa || row.tim?.user?.phone_number;
        if (!phone) {
          alert("Nomor WA tidak ditemukan untuk pengguna ini.");
          return;
        }
        
        let formattedPhone = phone.replace(/[^0-9]/g, "");
        if (formattedPhone.startsWith("0")) {
          formattedPhone = "62" + formattedPhone.slice(1);
        }
        
        const message = encodeURIComponent(
          `Halo, kami dari Panitia Turnamen Garuda Melayu Futsal. Ingin mengonfirmasi mengenai pendaftaran tim Anda: *${row.tim?.nama_tim}* untuk event *${row.event?.nama_event}*.`
        );
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pendaftaran</h1>
        <p className="text-base-content/60 mt-2">Verifikasi pendaftaran tim ke event</p>
      </div>
      <DataTable
        endpoint={`${API_URL}/pendaftaran`}
        title="Daftar Pendaftaran"
        dataKey="data"
        columns={columns}
        filterFields={["status"]}
        searchFields={["status"]}
        actions={actions}
      />
    </div>
  );
}
