import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { rupiah } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Kasir() {
  const { profile } = useAuth();
  const showToast = useToast();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState([]); // { product_id, name, price, qty }
  const [paid, setPaid] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*").order("id");
      if (!error) setProducts(data || []);
      setLoadingProducts(false);
    })();
  }, []);

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const paidValue = Number(paid) || 0;
  const change = paidValue - total;
  const canPay = cart.length > 0 && total > 0 && paidValue >= total;

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product_id === product.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }

  function changeQty(productId, delta) {
    setCart((prev) =>
      prev
        .map((c) => (c.product_id === productId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }

  async function handlePay() {
    setPaying(true);
    const { data: trx, error: trxError } = await supabase
      .from("transactions")
      .insert({ cashier_id: profile.id, total, paid: paidValue, change })
      .select()
      .single();

    if (trxError) {
      showToast("Gagal menyimpan transaksi.");
      setPaying(false);
      return;
    }

    const items = cart.map((item) => ({
      transaction_id: trx.id,
      product_id: item.product_id,
      product_name: item.name,
      price: item.price,
      qty: item.qty,
      subtotal: item.price * item.qty,
    }));

    const { error: itemsError } = await supabase.from("transaction_items").insert(items);
    showToast(itemsError ? "Transaksi tersimpan, namun detail item gagal disimpan." : "Transaksi berhasil disimpan.");

    setCart([]);
    setPaid("");
    setPaying(false);
  }

  return (
    <>
      <h1 className="page-title">Kasir</h1>
      <p className="page-sub">Pilih produk untuk ditambahkan ke keranjang.</p>

      <div className="kasir-layout">
        <div className="product-grid">
          {loadingProducts && <div className="loading-text">Memuat produk...</div>}
          {!loadingProducts && products.length === 0 && (
            <div className="empty-state">Belum ada produk. Tambahkan lewat Supabase.</div>
          )}
          {products.map((p) => (
            <button key={p.id} className="product-card" onClick={() => addToCart(p)}>
              <div className="product-thumb">
                {p.image_url ? <img src={p.image_url} alt={p.name} /> : "🧴"}
              </div>
              <div className="product-info">
                <p className="product-name">{p.name}</p>
                <p className="product-price">{rupiah(p.price)}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="cart-panel">
          <h2>Keranjang</h2>

          {cart.length === 0 && <div className="cart-empty">Keranjang masih kosong</div>}

          {cart.map((item) => (
            <div className="cart-item" key={item.product_id}>
              <div>
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-price">
                  {rupiah(item.price)} × {item.qty}
                </p>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => changeQty(item.product_id, -1)}>
                  −
                </button>
                <span>{item.qty}</span>
                <button className="qty-btn" onClick={() => changeQty(item.product_id, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">{rupiah(total)}</span>
            </div>

            <div className="field">
              <label htmlFor="paidInput">Uang dibayar</label>
              <input
                id="paidInput"
                type="number"
                placeholder="0"
                min="0"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
              />
            </div>

            <div className="cart-total-row">
              <span className="cart-total-label">Kembalian</span>
              <span className="cart-change-value">{rupiah(Math.max(change, 0))}</span>
            </div>

            <button className="btn-pay" disabled={!canPay || paying} onClick={handlePay}>
              {paying ? "Memproses..." : "Bayar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
