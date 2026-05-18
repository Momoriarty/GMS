import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-xs text-gray-400">Selamat datang kembali, Admin Garuda</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs font-bold text-slate-800">Admin Garuda</p>
          <p className="text-[10px] text-gray-400">Super Admin</p>
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-blue-500">
          <img src="https://ui-avatars.com/api/?name=Admin+Garuda" alt="avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
