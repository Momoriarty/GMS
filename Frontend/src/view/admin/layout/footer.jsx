export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-7 py-4 border-t border-white/5 bg-slate-900 flex items-center justify-between text-xs text-slate-500">
      <span>
        © {year}{" "}
        <span className="text-slate-300 font-semibold">Garuda Melayu</span> —
        Futsal & SSB. All rights reserved.
      </span>
      <span>v1.0.0</span>
    </footer>
  );
}
