import { Route, Routes, Navigate } from "react-router-dom";

// Auth
import Login from "./view/auth/Login";
import Register from "./view/auth/Register";
import Forgot from "./view/auth/Forgot";

// Guest
import Home from "./view/guest/Home";
import GuestProfile from "./view/guest/Profile";

// Admin
import AdminLayout from "./view/admin/AdminLayout";
import AdminDashboard from "./view/admin/Dashboard";
import Profile from "./view/admin/Profile";
import Pengguna from "./view/admin/Pengguna";
import Events from "./view/admin/Events";
import JadwalPertandingan from "./view/admin/JadwalPertandingan";
import HasilPertandingan from "./view/admin/HasilPertandingan";
import Pendaftaran from "./view/admin/Pendaftaran";
import Klasemen from "./view/admin/Klasemen";
import Notifikasi from "./view/admin/Notifikasi";
import AuditLog from "./view/admin/AuditLog";

// Route Guard
import ProtectedRoute from "./ProtectedRoute";

function RouteApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<Forgot />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="profile" element={<Profile />} />

          <Route path="pengguna" element={<Pengguna />} />

          <Route path="jadwal-pertandingan" element={<JadwalPertandingan />} />

          <Route path="hasil-pertandingan" element={<HasilPertandingan />} />

          <Route path="pendaftaran" element={<Pendaftaran />} />

          <Route path="notifikasi" element={<Notifikasi />} />

          <Route path="audit-log" element={<AuditLog />} />

          <Route path="events">
            <Route index element={<Events />} />

            <Route path=":eventId/klasemen" element={<Klasemen />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<GuestProfile />} />

      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
}

export default RouteApp;
