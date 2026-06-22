import { useState } from "react";

export default function DataCard({
  id,
  titleLeft,
  titleRight,
  date,
  location,
  badgeText = "VS", // Default teks badge tengah
  badgeClassName = "badge-warning", // Default warna badge
  actionButtonText = "Aksi", // Teks tombol aksi utama
  editModalTitle = "Form Aksi", // Judul modal
  editModalContent, // 👈 BARU: Menampung Form/Inputan dari luar komponen
  onDelete,
}) {
  const editModalId = `modal-edit-${id}`;
  const deleteModalId = `modal-delete-${id}`;

  const handleConfirmDelete = () => {
    if (onDelete) onDelete(id);
    document.getElementById(deleteModalId).close();
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow hover:shadow-lg transition">
      <div className="card-body p-4">
        {/* HEADER / VS SECTION */}
        <div className="flex justify-between items-center">
          <div
            className="w-[42%] text-right font-bold truncate"
            title={titleLeft}
          >
            {titleLeft}
          </div>
          <div
            className={`badge font-bold uppercase text-xs ${badgeClassName}`}
          >
            {badgeText}
          </div>
          <div
            className="w-[42%] text-left font-bold truncate"
            title={titleRight}
          >
            {titleRight}
          </div>
        </div>

        <div className="divider my-1"></div>

        {/* INFO & ACTIONS */}
        <div className="flex justify-between items-end text-sm">
          <div className="text-xs space-y-1">
            <div className="text-success flex gap-2 items-center">
              📅 {date}
            </div>
            <div className="opacity-70 flex gap-2 items-center">
              📍 {location}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2">
            <button
              onClick={() => document.getElementById(editModalId).showModal()}
              className="btn btn-info btn-xs text-white"
            >
              {actionButtonText}
            </button>
            {onDelete && (
              <button
                onClick={() =>
                  document.getElementById(deleteModalId).showModal()
                }
                className="btn btn-error btn-xs text-white"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MODAL EDIT/INPUT (FLEKSIBEL) ==================== */}
      <dialog id={editModalId} className="modal text-left">
        <div className="modal-box max-w-sm mx-auto">
          <h3 className="font-bold text-lg text-center mb-6">
            {editModalTitle}
          </h3>

          {/* Merender konten form apa saja yang dilempar dari komponen parent */}
          {editModalContent
            ? editModalContent(() =>
                document.getElementById(editModalId).close(),
              )
            : null}
        </div>
      </dialog>

      {/* ==================== MODAL HAPUS ==================== */}
      {onDelete && (
        <dialog id={deleteModalId} className="modal text-left">
          <div className="modal-box border border-error/20">
            <h3 className="font-bold text-lg text-error">Hapus Data?</h3>
            <p className="py-4 text-sm opacity-80">
              Apakah Anda yakin ingin menghapus data antara{" "}
              <span className="font-bold">{titleLeft}</span> VS{" "}
              <span className="font-bold">{titleRight}</span>?
            </p>
            <div className="modal-action">
              <button
                onClick={() => document.getElementById(deleteModalId).close()}
                className="btn btn-ghost"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-error text-white"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
