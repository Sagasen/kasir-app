import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/kasir", label: "Kasir", icon: "🧾", ownerOnly: false },
  { to: "/transaksi", label: "Transaksi", icon: "📋", ownerOnly: false },
  { to: "/produk", label: "Kelola Produk", icon: "📦", ownerOnly: true },
];

export default function Layout() {
  const { profile, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => !item.ownerOnly || profile?.role === "owner");

  const navLinks = (onClick) =>
    visibleItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClick}
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
      >
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </NavLink>
    ));

  return (
    <>
      <div className="mobile-topbar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">K</div>
          <div className="sidebar-brand-name">Kasir App</div>
        </div>
        <button className="mobile-menu-btn" onClick={() => setDrawerOpen((v) => !v)}>
          ☰
        </button>
      </div>
      <nav className={"mobile-nav-drawer" + (drawerOpen ? " open" : "")}>
        {navLinks(() => setDrawerOpen(false))}
      </nav>

      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark">K</div>
            <div className="sidebar-brand-name">Kasir App</div>
          </div>

          <nav>{navLinks()}</nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {profile?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="sidebar-user-name">{profile?.name || "—"}</div>
                <div className="sidebar-user-role">{profile?.role || "—"}</div>
              </div>
            </div>
            <button className="btn-logout" onClick={logout}>
              Keluar
            </button>
          </div>
        </aside>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
