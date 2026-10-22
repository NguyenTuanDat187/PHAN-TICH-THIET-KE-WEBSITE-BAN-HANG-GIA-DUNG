import { createBrowserRouter } from "react-router-dom";
import { StoreLayout } from "../components/layout/StoreLayout.tsx";
import { AboutPage } from "../pages/about/AboutPage.tsx";
import { AccountPage } from "../pages/account/AccountPage.tsx";
import { AuthPage } from "../pages/auth/AuthPage.tsx";
import { CartPage } from "../pages/cart/CartPage.tsx";
import { CheckoutPage } from "../pages/checkout/CheckoutPage.tsx";
import { ContactPage } from "../pages/contact/ContactPage.tsx";
import { HomePage } from "../pages/home/HomePage.tsx";
import { OrdersPage } from "../pages/orders/OrdersPage.tsx";
import { ProductDetailPage } from "../pages/product-detail/ProductDetailPage.tsx";
import { ProductsPage } from "../pages/products/ProductsPage.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StoreLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "shop", element: <ProductsPage /> },
      { path: "shop/:slug", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "login", element: <AuthPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "orders", element: <OrdersPage /> },
    ],
  },
]);
