import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // Ambil token yang kita simpan saat login berhasil kemarin
  const token = localStorage.getItem("token");

  // Jika token TIDAK ADA, langsung tendang ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ADA, izinkan untuk mengakses halaman anak (AdminLayout & Dashboard)
  return <Outlet />;
}