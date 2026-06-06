import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";

// PERBAIKAN: Jalur relative diubah naik 3 tingkat ke folder src/data
import productsData from "../../data/Product-gms.json";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  useEffect(() => {
    // Memastikan data aman sebelum dimasukkan ke state
    if (productsData) {
      setProducts(productsData);
    }
  }, []);

  // PERBAIKAN: Ditambahkan optional chaining (?.) agar tidak crash jika data kosong di awal render
  const categories = [
    "Semua",
    ...new Set(products?.map((item) => item.category).filter(Boolean)),
  ];

  const filteredProducts = (products || []).filter((item) => {
    const matchSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "Semua" || item.category === category;

    return matchSearch && matchCategory;
  });

  const totalValue = (products || []).reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );

  const highestProduct =
    products?.length > 0
      ? products.reduce((a, b) =>
          (a.price || 0) > (b.price || 0) ? a : b
        )
      : null;

  return (
    <div className="min-h-screen p-6 bg-[#0f172a] text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Product Management
          </h1>
          <p className="text-slate-400 mt-1">
            Kelola produk Garuda Melayu Futsal & SSB
          </p>
        </div>

        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-xl">
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      {/* Statistik */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1e293b] p-5 rounded-2xl">
          <Package className="text-amber-400 mb-3" />
          <h2 className="text-3xl font-bold">
            {products?.length || 0}
          </h2>
          <p className="text-slate-400">
            Total Produk
          </p>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-2xl">
          <h2 className="text-3xl font-bold text-green-400">
            {categories.length - 1}
          </h2>
          <p className="text-slate-400">
            Total Kategori
          </p>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-2xl">
          <h2 className="text-xl font-bold text-cyan-400">
            {highestProduct?.title || "-"}
          </h2>
          <p className="text-slate-400">
            Produk Termahal
          </p>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-2xl">
          <h2 className="text-xl font-bold text-purple-400">
            Rp {totalValue.toLocaleString("id-ID")}
          </h2>
          <p className="text-slate-400">
            Total Nilai Produk
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#1e293b] rounded-2xl p-5 mb-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-2"
            />
          </div>

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-2"
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-[#1e293b] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-slate-300">
                <th className="p-4 text-left">No</th>
                <th className="p-4 text-left">Gambar</th>
                <th className="p-4 text-left">Nama</th>
                <th className="p-4 text-left">Kategori</th>
                <th className="p-4 text-left">Brand</th>
                <th className="p-4 text-left">Harga</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800 hover:bg-[#243046]"
                >
                  <td className="p-4">
                    {index + 1}
                  </td>

                  <td className="p-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </td>

                  {/* PERBAIKAN: Dibungkus dengan Link agar bisa diklik */}
                  <td className="p-4 font-medium">
                    <Link 
                      to={`/product/${item.id}`} 
                      className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                    >
                      {item.title}
                    </Link>
                  </td>

                  <td className="p-4">
                    {item.category}
                  </td>

                  <td className="p-4">
                    {item.brand}
                  </td>

                  <td className="p-4 text-amber-400 font-semibold">
                    Rp{" "}
                    {(item.price || 0).toLocaleString(
                      "id-ID"
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg">
                        <Pencil size={15} />
                      </button>

                      <button className="bg-red-600 hover:bg-red-700 p-2 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-8 text-slate-400"
                  >
                    Produk tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}