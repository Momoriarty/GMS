import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-10 py-6 absolute w-full z-20 text-white font-sans">
      <div className="flex items-center gap-2">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoy6rJ4EAy8kna7BWVg-9rUbCPEna5FImeQQ&s"
          alt="Logo Garuda"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-bold text-xl tracking-tight">
          Garuda Melayu
        </span>
      </div>
      
      <div className="hidden md:flex gap-8 text-sm font-medium items-center">
        <Link to="/" className="text-blue-400">
          Beranda
        </Link>
        <Link to="/event" className="hover:text-blue-400 transition">
          Event
        </Link>
        <Link to="/jadwal" className="hover:text-blue-400 transition">
          Jadwal
        </Link>
        <Link to="/hasil" className="hover:text-blue-400 transition">
          Hasil Pertandingan
        </Link>
      </div>

      <Link
        to="/login"
        className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-full font-bold text-sm transition text-white text-center"
      >
        Login Dashboard
      </Link>
    </nav>
  );
};

export default Navbar;