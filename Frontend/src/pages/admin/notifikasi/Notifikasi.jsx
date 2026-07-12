import { useState, useEffect } from "react";
import DataTable from "../../../components/DataTable";
import { API_URL } from "@/data/api";
import { userApi } from "@/data/services";

const columns = [
  { key: "judul", label: "Judul" },
  { key: "pesan", label: "Pesan" },
  { key: "user_name", label: "Penerima" },
  { key: "tipe", label: "Tipe" },
];

export default function Notifikasi() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  async function loadUsers() {
    try {
      const response = await userApi.getAll();
      if (response.data.success) {
        setUsers(
          response.data.data.map((u) => ({ value: u.id, label: u.name }))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const createFields = [
    {
      key: "user_id",
      label: "Penerima",
      options: users,
      required: true,
    },
    {
      key: "judul",
      label: "Judul",
      type: "text",
      required: true,
    },
    {
      key: "pesan",
      label: "Pesan",
      type: "textarea",
      required: true,
    },
    {
      key: "tipe",
      label: "Tipe",
      options: [
        { value: "umum", label: "Umum" },
        { value: "pendaftaran", label: "Pendaftaran" },
        { value: "jadwal", label: "Jadwal" },
        { value: "hasil", label: "Hasil" },
      ],
      required: true,
    },
  ];

  if (loadingUsers) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <span className="loading loading-dots loading-md text-base-content/30" />
        <p className="text-xs text-base-content/30">Memuat data...</p>
      </div>
    );
  }

  return (
    <DataTable
      endpoint={`${API_URL}/notifikasi`}
      title="Notifikasi"
      dataKey="data"
      perPage={10}
      searchFields={["judul", "pesan", "tipe"]}
      filterFields={["tipe"]}
      columns={columns}
      creatable={true}
      createFields={createFields}
      deletable={true}
      deleteLabelKey="judul"
      sortable={true}
    />
  );
}
