export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#161b27] border-t border-white/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <span className="text-white/40 text-center sm:text-left tracking-wide">
        © {year}{" "}
        <span className="font-bold text-white">Garuda Melayu</span> —{" "}
        Futsal & SSB. All rights reserved.
      </span>
      <span className="font-medium text-white/25 bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:text-white/50 transition-colors cursor-default">
        v1.0.0
      </span>
    </footer>
  );
}