import { Link } from "react-router-dom";
import { PageBanner } from "../../components/layout/PageBanner.tsx";
import { formatPrice } from "../../data/catalog.ts";
import { readOrders } from "../../data/orders.ts";

export function OrdersPage() {
  const orders = readOrders();

  return (
    <>
      <PageBanner title="Orders" />
      <div className="wrap" style={{ padding: "64px 0" }}>
        {orders.length === 0 ? (
          <p>
            You have no orders yet. <Link to="/shop">Browse the shop</Link>
          </p>
        ) : (
          <div style={{ display: "grid", gap: 24 }}>
            {orders.map((order) => (
              <article key={order.id} style={{ borderBottom: "1px solid #e8e8e8", paddingBottom: 16 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 24 }}>
                  {order.id} · {order.status}
                </h2>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.slug}>
                      {item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
                <strong>Total {formatPrice(order.total)}</strong>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
