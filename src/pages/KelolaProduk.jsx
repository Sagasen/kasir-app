import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { uploadProductImage } from "../lib/uploadImage";
import { rupiah } from "../lib/format";
import { useToast } from "../context/ToastContext";

export default function KelolaProduk() {
  const showToast = useToast();

  const [products, setProducts] = useState(null); // null = loading
  const [error, setError] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadProducts() {
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error) setError(true);
    else setProducts(data);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleFileChange(e, isEdit) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditImageFile(file);
      setEditImagePreview(previewUrl);
    } else {
      setImageFile(file);
      setImagePreview(previewUrl);
    }
  }

  async function handleAdd() {
    const priceValue = Number(price);
    if (!name.trim() || !priceValue || priceValue <= 0) {
      showToast("Isi nama dan harga dengan benar.");
      return;
    }

    setAdding(true);
    try {
      let imageUrl = null;
      if (imageFile) imageUrl = await uploadProductImage(imageFile);

      const { error } = await supabase
        .from("products")
        .insert({ name: name.trim(), price: priceValue, image_url: imageUrl });
      if (error) throw error;

      setName("");
      setPrice("");
      setImageFile(null);
      setImagePreview(null);
      showToast("Produk ditambahkan.");
      loadProducts();
    } catch (err) {
      showToast("Gagal menambah produk.");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditImageFile(null);
    setEditImagePreview(product.image_url || null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditImageFile(null);
    setEditImagePreview(null);
  }

  async function saveEdit(id) {
    const priceValue = Number(editPrice);
    if (!editName.trim() || !priceValue || priceValue <= 0) {
      showToast("Isi nama dan harga dengan benar.");
      return;
    }

    setSavingEdit(true);
    try {
      const updates = { name: editName.trim(), price: priceValue };
      if (editImageFile) updates.image_url = await uploadProductImage(editImageFile);

      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;

      showToast("Produk diperbarui.");
      cancelEdit();
      loadProducts();
    } catch (err) {
      showToast("Gagal menyimpan perubahan.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus produk ini?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      showToast("Gagal menghapus produk.");
      return;
    }
    showToast("Produk dihapus.");
    loadProducts();
  }

  return (
    <>
      <h1 className="page-title">Kelola Produk</h1>
      <p className="page-sub">Tambah, ubah, atau hapus produk yang tampil di halaman Kasir.</p>

      <div className="card-block">
        <div className="expense-form">
          <input
            type="text"
            placeholder="Nama produk"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Harga (Rp)"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="file-input"
            onChange={(e) => handleFileChange(e, false)}
          />
          <button className="btn-add" onClick={handleAdd} disabled={adding}>
            {adding ? "Menyimpan..." : "Tambah Produk"}
          </button>
        </div>
        {imagePreview && (
          <div className="upload-preview">
            <img src={imagePreview} alt="Preview" />
            <span>Foto siap diupload</span>
          </div>
        )}

        <div className="table-wrap">
          {products === null && !error && <div className="loading-text">Memuat produk...</div>}
          {error && <div className="empty-state">Gagal memuat data produk.</div>}
          {products?.length === 0 && <div className="empty-state">Belum ada produk.</div>}

          {products?.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nama Produk</th>
                  <th>Harga</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    {editingId === p.id ? (
                      <>
                        <td>
                          <label className="table-thumb table-thumb-editable">
                            {editImagePreview ? (
                              <img src={editImagePreview} alt={editName} />
                            ) : (
                              "🧴"
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => handleFileChange(e, true)}
                            />
                          </label>
                        </td>
                        <td>
                          <input
                            className="inline-edit-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="inline-edit-input"
                            type="number"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                          />
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn-edit"
                              onClick={() => saveEdit(p.id)}
                              disabled={savingEdit}
                            >
                              {savingEdit ? "Menyimpan..." : "Simpan"}
                            </button>
                            <button className="btn-delete" onClick={cancelEdit}>
                              Batal
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="table-thumb">
                            {p.image_url ? <img src={p.image_url} alt={p.name} /> : "🧴"}
                          </div>
                        </td>
                        <td>{p.name}</td>
                        <td>{rupiah(p.price)}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-edit" onClick={() => startEdit(p)}>
                              Ubah
                            </button>
                            <button className="btn-delete" onClick={() => handleDelete(p.id)}>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
