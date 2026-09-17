import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { supabase } from "../lib/supabaseClient";
import { rupiah } from "../lib/format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Rekap() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("transactions")
        .select("total, created_at")
        .order("created_at");
      setTransactions(data || []);
      setLoading(false);
    })();
  }, []);

  const totalIncome = useMemo(() => transactions.reduce((s, t) => s + Number(t.total), 0), [transactions]);
  const transactionCount = transactions.length;
  const avgPerTransaction = transactionCount ? totalIncome / transactionCount : 0;

  const { labels, values } = useMemo(() => {
    const byDate = {};
    transactions.forEach((t) => {
      const day = t.created_at.slice(0, 10);
      byDate[day] = (byDate[day] || 0) + Number(t.total);
    });
    const labels = Object.keys(byDate).sort();
    return { labels, values: labels.map((d) => byDate[d]) };
  }, [transactions]);

  const avgPerDay = labels.length ? totalIncome / labels.length : 0;

  let summary = "Belum ada transaksi tercatat untuk periode ini.";
  if (transactionCount > 0) {
    if (values.length >= 2) {
      const first = values[0];
      const last = values[values.length - 1];
      if (last > first) summary = `Omset penjualan menunjukkan tren naik, dari ${rupiah(first)} ke ${rupiah(last)} per hari.`;
      else if (last < first) summary = `Omset penjualan menunjukkan tren turun, dari ${rupiah(first)} ke ${rupiah(last)} per hari.`;
      else summary = "Omset penjualan relatif stabil pada periode ini.";
    } else {
      summary = `Total ${transactionCount} transaksi tercatat dengan total pemasukan ${rupiah(totalIncome)}.`;
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Omset Penjualan (Rp)",
        data: values,
        borderColor: "#3B5BFF",
        backgroundColor: "rgba(59,91,255,0.1)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: labels.length > 0 } },
    scales: { y: { beginAtZero: true } },
  };

  if (loading) return <div className="loading-text">Memuat rekapitulasi...</div>;

  return (
    <>
      <h1 className="page-title">Rekapitulasi</h1>
      <p className="page-sub">Ringkasan performa penjualan toko.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Pemasukan</div>
          <div className="stat-value income">{rupiah(totalIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Jumlah Transaksi</div>
          <div className="stat-value">{transactionCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rata-rata per Transaksi</div>
          <div className="stat-value">{rupiah(avgPerTransaction)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rata-rata per Hari</div>
          <div className="stat-value">{rupiah(avgPerDay)}</div>
        </div>
      </div>

      <div className="rekap-layout">
        <div className="card-block">
          <p className="chart-title">Grafik Penjualan Harian</p>
          <Line data={chartData} options={chartOptions} height={140} />
        </div>
        <div className="card-block">
          <p className="summary-title">Ringkasan</p>
          <div className="summary-text">{summary}</div>
        </div>
      </div>
    </>
  );
}
