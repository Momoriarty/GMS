export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-base-300 border-t border-base-content/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-base-content">
      <span className="text-base-content/50 text-center sm:text-left tracking-wide">
        © {year}{" "}
        <span className="font-bold text-base-content">Garuda Melayu</span> —{" "}
        Futsal. All rights reserved.
      </span>
      <span className="font-medium text-base-content/40 bg-base-content/5 px-3 py-1 rounded-full border border-base-content/10 hover:text-base-content/70 transition-colors cursor-default">
        v1.0.0
      </span>
    </footer>
  );
}