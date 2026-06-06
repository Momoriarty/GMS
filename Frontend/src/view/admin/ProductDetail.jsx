import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, Tag, Layers } from "lucide-react";

// Mengambil data dari file JSON lokal Anda
import productsData from "../../data/Product-gms.json";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Mencari produk berdasarkan ID yang ada di URL
      // id dari useParams berbentuk string, jadi kita samakan tipenya menggunakan String() atau Number()
      const foundProduct = productsData.find(
        (item) => String(item.id) === String(id)
      );

      if (!foundProduct) {
        setError("Produk tidak ditemukan di database.");
        return;
      }

      setProduct(foundProduct);
    } catch (err) {
      setError("Gagal memuat detail produk: " + err.message);
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-md text-center">
          <p className="font-semibold mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <p className="text-slate-400 animate-pulse">Memuat detail produk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#0f172a] text-white">
      {/* Tombol Kembali */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Kembali ke daftar</span>
      </button>

      {/* Kartu Detail Produk */}
      <div className="max-w-4xl mx-auto bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl grid md:grid-cols-2 gap-6 p-6">
        
        {/* Bagian Gambar */}
        <div className="w-full h-80 md:h-full min-h-[300px] rounded-xl overflow-hidden bg-[#0f172a] border border-slate-700/50">
          <img
            src={product.image || product.thumbnail} // Menyesuaikan jika propertinya bernama 'image' atau 'thumbnail'
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Bagian Informasi Text */}
        <div className="flex flex-col justify-between py-2">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              {product.title}
            </h2>
            
            <div className="space-y-3.5 mb-6">
              <div className="flex items-center gap-3 text-slate-300 bg-[#0f172a]/50 p-3 rounded-xl border border-slate-800">
                <Layers size={18} className="text-amber-400" />
                <span className="text-sm">
                  <strong className="text-slate-400">Kategori:</strong> {product.category}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-300 bg-[#0f172a]/50 p-3 rounded-xl border border-slate-800">
                <Tag size={18} className="text-cyan-400" />
                <span className="text-sm">
                  <strong className="text-slate-400">Brand:</strong> {product.brand}
                </span>
              </div>
            </div>
          </div>

          {/* Bagian Harga */}
          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Harga Total
            </span>
            <span className="text-2xl font-bold text-amber-400">
              Rp {(product.price || 0).toLocaleString("id-ID")}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}