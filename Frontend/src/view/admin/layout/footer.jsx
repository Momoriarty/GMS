export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ml-[220px] px-7 py-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-400">
      <span>
        © {year}{" "}
        <span className="text-slate-600 font-semibold">Garuda Melayu</span>{" "}
        — Futsal & SSB. All rights reserved.
      </span>
      <span>v1.0.0</span>
    </footer>
  );
}