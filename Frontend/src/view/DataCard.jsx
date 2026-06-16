export default function DataCard({
  titleLeft,
  titleRight,
  date,
  location,
  onEdit,
  onDelete,
}) {
  return (
    <div className="card bg-base-200 border border-base-300 shadow hover:shadow-lg transition">
      <div className="card-body p-4">

        {/* VS SECTION */}
        <div className="flex justify-between items-center">
          <div className="w-[42%] text-right font-bold truncate">
            {titleLeft}
          </div>

          <div className="badge badge-warning font-bold">VS</div>

          <div className="w-[42%] text-left font-bold truncate">
            {titleRight}
          </div>
        </div>

        <div className="divider my-1"></div>

        {/* INFO */}
        <div className="flex justify-between items-end text-sm">

          <div className="text-xs space-y-1">
            <div className="text-success flex gap-2 items-center">
              📅 {date}
            </div>
            <div className="opacity-70 flex gap-2 items-center">
              📍 {location}
            </div>
          </div>

          {/* ACTION */}
          <div className="flex gap-2">
            <button onClick={onEdit} className="btn btn-info btn-xs text-white">
              Edit
            </button>

            <button onClick={onDelete} className="btn btn-error btn-xs text-white">
              Hapus
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}