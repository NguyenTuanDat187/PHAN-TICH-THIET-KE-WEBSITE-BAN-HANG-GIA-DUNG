import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button, Quantity, showToast } from "../../components/common/index.ts";
import { ProductCard } from "../../components/product/ProductCard.tsx";
import { useCart } from "../../contexts/useCart.ts";
import { formatPrice, getProduct, products } from "../../data/catalog.ts";
import styles from "./ProductDetailPage.module.css";

const sizes = ["L", "XL", "XS"];
const colors = ["#816DFA", "#000000", "#B88E2F"];

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const product = getProduct(slug);
  const { add } = useCart();
  const [size, setSize] = useState("L");
  const [color, setColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"description" | "info" | "reviews">("description");

  if (!product) return <Navigate to="/shop" replace />;

  const related = products.filter((item) => item.slug !== product.slug).slice(0, 4);

  return (
    <>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">&gt;</span>
        <Link to="/shop">Shop</Link>
        <span aria-hidden="true">&gt;</span>
        <span className={styles.current}>{product.name}</span>
      </nav>
      <div className={`wrap ${styles.layout}`}>
        <div className={styles.thumbs}>
          {related.slice(0, 4).map((item) => (
            <Link key={item.slug} to={`/shop/${item.slug}`}>
              <img src={item.image} alt="" />
            </Link>
          ))}
        </div>
        <div className={styles.photo}>
          <img src={product.image} alt={product.name} />
        </div>
        <div className={styles.info}>
          <h1>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <p className={styles.stars}>★★★★★ <span style={{ color: "#9f9f9f" }}>5 Customer Review</span></p>
          <p>{product.description}</p>
          <div className={styles.choices}>
            <span>Size</span>
            <div className={styles.sizes}>
              {sizes.map((item) => (
                <button key={item} type="button" aria-pressed={size === item} onClick={() => setSize(item)}>
                  {item}
                </button>
              ))}
            </div>
            <span>Color</span>
            <div className={styles.colors}>
              {colors.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={item}
                  aria-pressed={color === item}
                  style={{ background: item }}
                  onClick={() => setColor(item)}
                />
              ))}
            </div>
          </div>
          <div className={styles.buyRow}>
            <Quantity value={quantity} onChange={(value) => setQuantity(Math.max(1, value))} />
            <Button
              variant="outline"
              onClick={() => {
                add(product.slug, quantity);
                showToast(`${product.name} added to cart.`, "success");
              }}
            >
              Add To Cart
            </Button>
          </div>
          <p className={styles.meta}>
            SKU: {product.sku}
            <br />
            Category: {product.category}
            <br />
            Tags: Sofa, Chair, Home, Shop
          </p>
        </div>
      </div>
      <section className={`wrap ${styles.tabs}`}>
        <div className={styles.tabList} role="tablist">
          {(["description", "info", "reviews"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setTab(item)}
            >
              {item === "description" ? "Description" : item === "info" ? "Additional Information" : "Reviews [5]"}
            </button>
          ))}
        </div>
        <div className={styles.copy}>
          {tab === "description" ? (
            <p>{product.description} Embodying the raw, wayward spirit of rock and roll, the {product.name} is designed with comfort and character for everyday rooms.</p>
          ) : null}
          {tab === "info" ? <p>Size {size}. Handmade from solid wood with a fabric finish. Weight and dimensions vary slightly by piece.</p> : null}
          {tab === "reviews" ? <p>Customers rate this piece 5 stars for comfort and finish. Reviews are sample content for the storefront.</p> : null}
        </div>
      </section>
      <section className={`wrap ${styles.related}`}>
        <h2>Related Products</h2>
        <div className={styles.grid}>
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </>
  );
}
