import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput, showToast } from "../../components/common/index.ts";
import { FeatureBar } from "../../components/layout/FeatureBar.tsx";
import { PageBanner } from "../../components/layout/PageBanner.tsx";
import { useCart } from "../../contexts/useCart.ts";
import { formatPrice, getProduct } from "../../data/catalog.ts";
import { saveOrder } from "../../data/orders.ts";
import styles from "./CheckoutPage.module.css";

export function CheckoutPage() {
  const { lines, clear } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState("bank");
  const detailed = lines
    .map((line) => {
      const product = getProduct(line.slug);
      return product ? { ...line, product } : null;
    })
    .filter((line) => line !== null);
  const total = detailed.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (detailed.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }
    saveOrder({
      id: `ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      total,
      status: "Processing",
      items: detailed.map((line) => ({
        slug: line.slug,
        name: line.product.name,
        quantity: line.quantity,
        price: line.product.price,
      })),
    });
    clear();
    showToast("Order placed.", "success");
    navigate("/orders");
  }

  return (
    <>
      <PageBanner title="Checkout" />
      <form className={`wrap ${styles.layout}`} onSubmit={placeOrder}>
        <div>
          <h2>Billing details</h2>
          <div className={styles.form}>
            <TextInput label="First name" name="firstName" required fullWidth />
            <TextInput label="Last name" name="lastName" required fullWidth />
            <div className={styles.full}>
              <TextInput label="Company name (optional)" name="company" fullWidth />
            </div>
            <div className={styles.full}>
              <TextInput label="Country / Region" name="country" defaultValue="Vietnam" required fullWidth />
            </div>
            <div className={styles.full}>
              <TextInput label="Street address" name="street" required fullWidth />
            </div>
            <TextInput label="Town / City" name="city" required fullWidth />
            <TextInput label="ZIP code" name="zip" required fullWidth />
            <TextInput label="Phone" name="phone" required fullWidth />
            <TextInput label="Email address" name="email" type="email" required fullWidth />
            <div className={styles.full}>
              <TextInput label="Additional information" name="note" fullWidth />
            </div>
          </div>
        </div>
        <aside className={styles.summary}>
          <h2>Product</h2>
          {detailed.length === 0 ? (
            <p>
              No items yet. <Link to="/shop">Return to shop</Link>
            </p>
          ) : (
            detailed.map((line) => (
              <div key={line.slug} className={styles.line}>
                <span className={styles.productName}>
                  {line.product.name} × {line.quantity}
                </span>
                <span>{formatPrice(line.product.price * line.quantity)}</span>
              </div>
            ))
          )}
          <div className={styles.totals}>
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className={styles.totals}>
            <span>Total</span>
            <span className={styles.total}>{formatPrice(total)}</span>
          </div>
          <div className={styles.payments}>
            <label>
              <input
                type="radio"
                name="payment"
                checked={payment === "bank"}
                onChange={() => setPayment("bank")}
              />{" "}
              Direct Bank Transfer
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
              />{" "}
              Cash On Delivery
            </label>
          </div>
          <p className={styles.note}>
            Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our privacy policy.
          </p>
          <Button type="submit" variant="outline" fullWidth>
            Place order
          </Button>
        </aside>
      </form>
      <FeatureBar />
    </>
  );
}
