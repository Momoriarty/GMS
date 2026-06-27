import React from "react";
import { Outlet } from "react-router-dom";
// KOREKSI DI SINI: Ubah 'Navbar' jadi 'navbar' dan 'Footer' jadi 'footer'
import Navbar from "./layout/navbar"; 
import Footer from "./layout/footer"; 

const GuestLayout = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#07090f", color: "#fff", fontFamily: "sans-serif" }}>

            <Navbar />

            <main style={{ flex: 1, padding: "20px 32px" }}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default GuestLayout;