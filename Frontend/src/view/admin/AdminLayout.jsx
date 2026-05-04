import { Outlet } from "react-router-dom";
import Sidebar from "./layout/navbar";
import Navbar from "./layout/sidebar";
import Footer from "./layout/footer";

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <Navbar />
            <main className="ml-[220px] mt-[70px] p-6 min-h-[calc(100vh-70px)] flex flex-col">
                <div className="flex-1">
                    <Outlet />
                </div>
                <Footer />
            </main>
        </div>
    );
}