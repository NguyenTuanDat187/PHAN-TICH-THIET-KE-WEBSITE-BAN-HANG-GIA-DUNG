import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/useCart.ts";
import { formatPrice, getProduct } from "../../data/catalog.ts";
import styles from "./CartDrawer.module.css";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lines, remove } = useCart();
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

  if (!open) return null;

  return createPortal(
    <div className={styles.open}>
      <button type="button" className={styles.backdrop} aria-label="Close cart" onClick={onClose} />
      <aside className={styles.panel} role="dialog" aria-label="Shopping cart">
        <header className={styles.head}>
          <h2>Shopping Cart</h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        {detailed.length === 0 ? (
          <p className={styles.empty}>Your cart is empty.</p>
        ) : (
          <ul className={styles.list}>
            {detailed.map((line) => (
              <li key={line.slug}>
                <img src={line.product.image} alt="" />
                <div>
                  <p>{line.product.name}</p>
                  <span>
                    {line.quantity} x {formatPrice(line.product.price)}
                  </span>
                </div>
                <button type="button" aria-label={`Remove ${line.product.name}`} onClick={() => remove(line.slug)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.subtotal}>
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <div className={styles.actions}>
          <Link to="/cart" onClick={onClose}>Cart</Link>
          <Link to="/checkout" onClick={onClose}>Checkout</Link>
          <Link to="/shop" onClick={onClose}>Comparison</Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
