import AdminLayout from "./view/admin/AdminLayout";
import AdminDashboard from "./view/admin/Dashboard";
import Login from "./view/auth/login";
import Register from "./view/auth/Register";
import Forgot from "./view/auth/Forgot";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./view/guest/LandingPage";

function RouteApp() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />
        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
        {/*Guest*/}
        <Route path="/landingPage" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default RouteApp;
