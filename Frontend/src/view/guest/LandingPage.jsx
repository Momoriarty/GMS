import { Link } from "react-router-dom";
import React from "react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6 absolute w-full z-20">
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
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#" className="text-blue-400">
            Beranda
          </a>
          <a href="#" className="hover:text-blue-400 transition">
            Event
          </a>
          <a href="#" className="hover:text-blue-400 transition">
            Jadwal
          </a>
          <a href="#" className="hover:text-blue-400 transition">
            Hasil
          </a>
        </div>

        {/* INI PERUBAHANNYA: Menggunakan Link untuk ke Dashboard */}
        <Link
          to="/login"
          className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-full font-bold text-sm transition text-white text-center"
        >
          Login Dashboard
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center px-10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://emosijiwaku.com/wp-content/uploads/2025/07/Website-44.png"
            className="w-full h-full object-cover opacity-30"
            alt="futsal"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-3xl">
          <span className="text-orange-500 font-bold text-xs tracking-[0.3em] uppercase mb-4 block">
            PLATFORM RESMI EVENT OLAHRAGA
          </span>
          <h1 className="text-6xl font-black leading-tight mb-6">
            Pusat Manajemen <br />
            <span className="text-blue-500 italic">Event Fun Futsal</span>{" "}
            <br />
            Dipekanbaru
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl">
            Kelola turnamen, daftarkan tim, dan pantau jadwal pertandingan
            secara profesional di seluruh Indonesia.
          </p>
          <div className="flex gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-lg font-bold transition">
              Lihat Event
            </button>
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-lg font-bold transition">
              Pelajari Lebih
            </button>
          </div>
        </div>
      </section>

      {/* Event Section */}
      <section className="py-20 px-10 bg-white text-slate-900">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-orange-500 font-bold text-xs tracking-widest uppercase">
              Segera Hadir
            </span>
            <h2 className="text-3xl font-black mt-2">Event Mendatang</h2>
          </div>
          <button className="text-blue-600 font-bold text-sm underline">
            Lihat Semua Event →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="bg-slate-50 rounded-2xl overflow-hidden shadow-lg border border-slate-100"
            >
              <div className="h-48 bg-slate-200 relative">
                <img
                  src="https://cdn0-production-images-kly.akamaized.net/I0hOVhWXhAKwlC0jCPgPGY4hDkg=/800x450/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5489476/original/037355100_1769872866-1.jpg"
                  className="w-full h-full object-cover"
                  alt="event"
                />
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  Futsal
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-slate-800">
                  Liga Garuda Futsal Championship 2025
                </h3>
                <p className="text-gray-500 text-xs mb-4">
                  📍 GOR Zidane futsal, Pekanbaru
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-bold text-xs italic">
                    Sisa 4 Slot
                  </span>
                  <button className="bg-[#1e253a] text-white px-4 py-2 rounded-lg text-xs font-bold transition hover:bg-slate-700">
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e253a] py-16 px-10 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs text-white">
                GM
              </div>
              <span className="font-bold text-lg">Garuda Melayu</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Platform manajemen event futsal dan sekolah sepak bola profesional
              yang terpercaya di Indonesia.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm">Navigasi</h4>
            <ul className="text-gray-400 text-xs space-y-3">
              <li className="cursor-pointer hover:text-white transition">
                Beranda
              </li>
              <li className="cursor-pointer hover:text-white transition">
                Event
              </li>
              <li className="cursor-pointer hover:text-white transition">
                Jadwal
              </li>
              <li className="cursor-pointer hover:text-white transition">
                Hasil Pertandingan
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm">Kontak Kami</h4>
            <ul className="text-gray-400 text-xs space-y-3">
              <li>📞 +62 812-3456-7890</li>
              <li>📧 info@garudamelayu.id</li>
              <li>📱 @farhangusri_</li>
              <li>📍 Jl. Meranti No. 10, Pekanbaru</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 text-center text-gray-500 text-[10px]">
          © 2026 Garuda Melayu. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
