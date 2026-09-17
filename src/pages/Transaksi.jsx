import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { rupiah, dateFmt } from "../lib/format";

export default function Transaksi() {
  const [transactions, setTransactions] = useState(null); // null = loading
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setError(true);
      } else {
        setTransactions(data);
      }
    })();
  }, []);

  return (
    <>
      <h1 className="page-title">Transaksi</h1>
      <p className="page-sub">Riwayat seluruh transaksi penjualan.</p>

      <div className="card-block">
        <div className="table-wrap">
          {transactions === null && !error && <div className="loading-text">Memuat transaksi...</div>}
          {error && <div className="empty-state">Gagal memuat data transaksi.</div>}
          {transactions?.length === 0 && <div className="empty-state">Belum ada transaksi.</div>}

          {transactions?.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Kasir</th>
                  <th>Total</th>
                  <th>Dibayar</th>
                  <th>Kembalian</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{dateFmt(t.created_at)}</td>
                    <td>{t.profiles?.name || "-"}</td>
                    <td>{rupiah(t.total)}</td>
                    <td>{rupiah(t.paid)}</td>
                    <td>{rupiah(t.change)}</td>
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
