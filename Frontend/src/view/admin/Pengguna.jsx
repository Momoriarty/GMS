import DataTable from "../DataTable";

const STATUS_COLORS = {
  active: { bg: "rgba(99,153,34,0.12)", color: "#3b6d11", dot: true },
  inactive: { bg: "rgba(226,75,74,0.10)", color: "#a32d2d", dot: true },
};

export default function Peserta() {
  return (
    <DataTable
      endpoint="http://127.0.0.1:8000/api/users"
      title="Daftar user"
      searchFields={["name", "email", "username"]}
      filterFields={["role", "status"]}
      editable
      deletable
      deleteLabelKey="name"
      deleteSubKey="email"
      columns={[
        { key: "name", label: "Nama", type: "avatar", subKey: "username" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", type: "badge" },
        { key: "status", label: "Status", type: "badge", colorMap: STATUS_COLORS },
      ]}
      editFields={[
        { key: "name", label: "Nama", type: "text" },
        { key: "email", label: "Email", type: "email" },
        { key: "username", label: "Username", type: "text" },
        { key: "role", label: "Role", options: ["admin", "user", "peserta"] },
        { key: "status", label: "Status", options: ["active", "inactive"] },
      ]}
      creatable
      createFields={[
        { key: "name", label: "Nama", type: "text", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "username", label: "Username", type: "text", required: true },
        { key: "password", label: "Password", type: "password", required: true },
        { key: "role", label: "Role", options: ["admin", "user", "mentor"] },
        { key: "status", label: "Status", options: ["active", "inactive"] },
      ]}

    />
  );
}