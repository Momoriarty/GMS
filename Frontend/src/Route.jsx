import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Route Guard (Keep static)
import ProtectedRoute from "./ProtectedRoute";

// Lazy Loaded Components
// Auth
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Forgot = lazy(() => import("./pages/auth/Forgot"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));

// Guest
const Home = lazy(() => import("./pages/guest/home/Home"));
const GuestLayout = lazy(() => import("./pages/guest/layout/GuestLayout"));
const GuestProfile = lazy(() => import("./pages/guest/profile/GuestProfile"));
const GuestEvent = lazy(() => import("./pages/guest/event/DetailEvent"));

// Admin
const AdminLayout = lazy(() => import("./pages/admin/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/dashboard/Dashboard"));
const Profile = lazy(() => import("./pages/admin/profile/profile"));
const Pengguna = lazy(() => import("./pages/admin/pengguna/Pengguna"));
const Events = lazy(() => import("./pages/admin/event/Events"));
const JadwalPertandingan = lazy(() => import("./pages/admin/event/JadwalPertandingan"));
const HasilPertandingan = lazy(() => import("./pages/admin/event/HasilPertandingan"));
const Pendaftaran = lazy(() => import("./pages/admin/pendaftaran/Pendaftaran"));
const Klasemen = lazy(() => import("./pages/admin/event/Klasemen"));
const Notifikasi = lazy(() => import("./pages/admin/notifikasi/Notifikasi"));
const AuditLog = lazy(() => import("./pages/admin/auditLog/AuditLog"));
const Keuangan = lazy(() => import("./pages/admin/laporan/Keuangan"));
const Database = lazy(() => import("./pages/admin/database/Database"));

// Loading Spinner Component
const FallbackLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function RouteApp() {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="profile" element={<Profile />} />

            <Route path="pengguna" element={<Pengguna />} />

            <Route path="hasil-pertandingan" element={<HasilPertandingan />} />

            <Route path="pendaftaran" element={<Pendaftaran />} />

            <Route path="notifikasi" element={<Notifikasi />} />

            <Route path="keuangan" element={<Keuangan />} />

            <Route path="audit-log" element={<AuditLog />} />

            <Route path="database" element={<Database />} />

            <Route path="events">
              <Route index element={<Events />} />

              <Route path=":id/klasemen" element={<Klasemen />} />
              <Route path=":id/jadwal" element={<JadwalPertandingan />} />

              <Route
                path=":id/tim/:timId/jadwal"
                element={<JadwalPertandingan />}
              />
            </Route>

          </Route>
        </Route>

        <Route path="/" element={<GuestLayout />}>
          <Route index element={<Home />} />
          <Route path="/profile" element={<GuestProfile />} />
          <Route path="/events/:id" element={<GuestEvent />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default RouteApp;