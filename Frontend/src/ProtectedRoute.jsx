import { Navigate, Outlet } from "react-router-dom";

const allowedRoles = ["admin", "owner"];

export default function ProtectedRoute() {
  // Ambil token dan role yang kita simpan saat login berhasil kemarin
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Jika token TIDAK ADA atau role tidak sesuai, langsung tendang ke halaman login
  if (!token || !allowedRoles.includes(role)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  // Jika role TERIZIN, izinkan untuk mengakses halaman anak (AdminLayout & Dashboard)
  return <Outlet />;
}