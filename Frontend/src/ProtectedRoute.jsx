import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const allowedRoles = ["admin", "owner"];

export default function ProtectedRoute() {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const invalidate = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setIsAuthorized(false);
      setChecking(false);
    };

    if (!token || !allowedRoles.includes(role)) {
      invalidate();
      return;
    }

    axios
      .get("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const userRole = response.data?.role;
        if (allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
        } else {
          invalidate();
        }
      })
      .catch(() => {
        invalidate();
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Memeriksa otentikasi...
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
