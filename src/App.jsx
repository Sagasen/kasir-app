import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Kasir from "./pages/Kasir";
import Transaksi from "./pages/Transaksi";
import KelolaProduk from "./pages/KelolaProduk";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/kasir" element={<Kasir />} />
              <Route path="/transaksi" element={<Transaksi />} />
              <Route
                path="/produk"
                element={
                  <ProtectedRoute ownerOnly>
                    <KelolaProduk />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/" element={<Navigate to="/kasir" replace />} />
            <Route path="*" element={<Navigate to="/kasir" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
