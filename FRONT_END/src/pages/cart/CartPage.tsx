import { Link } from "react-router-dom";
import { Button, Quantity } from "../../components/common/index.ts";
import { FeatureBar } from "../../components/layout/FeatureBar.tsx";
import { PageBanner } from "../../components/layout/PageBanner.tsx";
import { useCart } from "../../contexts/useCart.ts";
import { formatPrice, getProduct } from "../../data/catalog.ts";
import styles from "./CartPage.module.css";

export function CartPage() {
  const { lines, setQuantity, remove } = useCart();
  const detailed = lines
    .map((line) => {
      const product = getProduct(line.slug);
      return product ? { ...line, product } : null;
    })
    .filter((line) => line !== null);
  const subtotal = detailed.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );

  return (
    <>
      <PageBanner title="Cart" />
      {detailed.length === 0 ? (
        <div className={`wrap ${styles.empty}`}>
          <p>Your cart is empty.</p>
          <Button variant="primary" onClick={() => undefined}>
            <Link to="/shop" style={{ color: "inherit", textDecoration: "none" }}>
              Continue shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className={`wrap ${styles.layout}`}>
          <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {detailed.map((line) => (
                <tr key={line.slug}>
                  <td>
                    <Link to={`/shop/${line.slug}`} className={styles.product}>
                      <img src={line.product.image} alt="" />
                      {line.product.name}
                    </Link>
                  </td>
                  <td>{formatPrice(line.product.price)}</td>
                  <td>
                    <Quantity
                      value={line.quantity}
                      onChange={(value) => setQuantity(line.slug, value)}
                    />
                  </td>
                  <td>{formatPrice(line.product.price * line.quantity)}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`Remove ${line.product.name}`}
                      onClick={() => remove(line.slug)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <aside className={styles.totals}>
            <h2>Cart Totals</h2>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.row}>
              <span>Total</span>
              <span className={styles.total}>{formatPrice(subtotal)}</span>
            </div>
            <Button variant="outline">
              <Link to="/checkout" style={{ color: "inherit", textDecoration: "none" }}>
                Check Out
              </Link>
            </Button>
          </aside>
        </div>
      )}
      <FeatureBar />
    </>
  );
}
