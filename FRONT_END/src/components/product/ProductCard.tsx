import { Link } from "react-router-dom";
import { formatPrice, type Product } from "../../data/catalog.ts";
import { useCart } from "../../contexts/useCart.ts";
import { Button, showToast } from "../common/index.ts";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className={styles.card}>
      <Link to={`/shop/${product.slug}`} className={styles.media}>
        <img src={product.image} alt={product.name} />
      </Link>
      {product.badge ? (
        <span className={`${styles.badge} ${styles[product.badge.kind]}`}>
          {product.badge.label}
        </span>
      ) : null}
      <Link to={`/shop/${product.slug}`} className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.subtitle}>{product.subtitle}</p>
        <div className={styles.prices}>
          <strong>{formatPrice(product.price)}</strong>
          {product.originalPrice ? (
            <s>{formatPrice(product.originalPrice)}</s>
          ) : null}
        </div>
      </Link>
      <div className={styles.overlay}>
        <Link
          to={`/shop/${product.slug}`}
          className={styles.detailLink}
          aria-label={`View ${product.name}`}
        />
        <Button
          variant="secondary"
          onClick={() => {
            add(product.slug);
            showToast(`${product.name} added to cart.`, "success");
          }}
        >
          Add to cart
        </Button>
        <div className={styles.actions}>
          <button type="button" onClick={() => showToast("Link copied.", "success")}>
            Share
          </button>
          <button type="button" onClick={() => showToast("Added to compare.", "success")}>
            Compare
          </button>
          <button type="button" onClick={() => showToast("Saved to your wishlist.", "success")}>
            Like
          </button>
        </div>
      </div>
    </article>
  );
}
