import AdminLayout from "./view/admin/AdminLayout";
import AdminDashboard from "./view/admin/Dashboard";
import Login from "./view/auth/login";
import Register from "./view/auth/Register";
import Forgot from "./view/auth/Forgot";
import { Route, Routes } from "react-router-dom";
import Home from "./view/guest/Home";
import ProtectedRoute from "./ProtectedRoute"; 
import GuestProfile from "./view/guest/profile";
import Profile from "./view/admin/Profile";
import Pengguna from "./view/admin/Pengguna";
import Products from "./view/admin/Product";
import ProductDetail from "./view/admin/ProductDetail"; 

function RouteApp() {
  return (
    <>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />

        {/* Admin Group */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="" element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="Pengguna" element={<Pengguna />} />
            {/* PERBAIKAN: Memasukkan route product ke sini agar tampil di dalam dashboard admin */}
            <Route path="product" element={<Products />} />
          </Route>
        </Route>

        {/* Guest */}
        <Route path="/profile" element={<GuestProfile />} />
        <Route path="/" element={<Home />} />
        
        {/* detail product */}
        <Route path="product/:id" element={<ProductDetail />} />
      </Routes>
    </>
  );
}

export default RouteApp;