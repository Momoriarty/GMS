import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1e253a] py-16 px-10 border-t border-white/5 text-white font-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs text-white">
              GM
            </div>
            <span className="font-bold text-lg">Garuda Melayu</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Platform manajemen event futsal dan sekolah sepak bola profesional yang terpercaya di Indonesia.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-sm">Navigasi</h4>
          <ul className="text-gray-400 text-xs space-y-3">
            <li>
              <Link to="/" className="hover:text-white transition block">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/event" className="hover:text-white transition block">
                Event
              </Link>
            </li>
            <li>
              <Link to="/jadwal" className="hover:text-white transition block">
                Jadwal
              </Link>
            </li>
            <li>
              <Link to="/hasil" className="hover:text-white transition block">
                Hasil Pertandingan
              </Link>
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
  );
};

export default Footer;