import AdminLayout from "./view/admin/AdminLayout";
import AdminDashboard from "./view/admin/Dashboard";
import Login from "./view/auth/login";
import Register from "./view/auth/Register";
import Forgot from "./view/auth/Forgot";
import { Route, Routes } from "react-router-dom";
import Home from "./view/guest/Home";
import ProtectedRoute from "./ProtectedRoute"; // 1. Perbaikan: Import komponen proteksi tadi
import Navbar from "./view/guest/layout/navbar";
import Footer from "./view/guest/layout/footer";

function RouteApp() {
  return (
    <>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />

        {/* 2. Perbaikan: Bungkus area ADMIN dengan ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="" element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Guest */}
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default RouteApp;