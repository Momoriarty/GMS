import React from 'react';

const Sidebar = () => {
  const menus = [
    { name: 'Dashboard', icon: '📊', active: true },
    { name: 'Kelola Event', icon: '🏆' },
    { name: 'Kelola Peserta', icon: '👥', badge: '15' },
    { name: 'Jadwal Pertandingan', icon: '📅' },
    { name: 'Input Hasil', icon: '📝' },
    { name: 'Notifikasi', icon: '🔔', badge: '3' },
    { name: 'Laporan', icon: '📁' },
    { name: 'Kelola Akun', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-[#1e253a] min-h-screen text-white p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">GM</div>
        <div>
          <h1 className="font-bold text-sm leading-tight">Garuda Melayu</h1>
          <p className="text-[10px] text-gray-400">FUTSAL & SSB</p>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-gray-500 text-[10px] font-bold uppercase mb-4 tracking-wider">Menu Utama</p>
        <nav className="space-y-1">
          {menus.map((menu, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                menu.active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 text-sm">
                <span>{menu.icon}</span>
                {menu.name}
              </div>
              {menu.badge && (
                <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full text-white">
                  {menu.badge}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      <button className="flex items-center gap-3 text-gray-400 hover:text-white text-sm p-3 mt-auto">
        <span>🚪</span> Logout
      </button>
    </div>
  );
};

export default Sidebar;
