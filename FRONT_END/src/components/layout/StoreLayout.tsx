import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../../styles/store.css";
import { CartDrawer } from "./CartDrawer.tsx";
import { Footer } from "./Footer.tsx";
import { Header } from "./Header.tsx";

export function StoreLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCartOpen(false);
  }, [location.pathname]);

  return (
    <div className="shell">
      <Header onOpenCart={() => setCartOpen(true)} />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
