import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../common/Toast/showToast.tsx";
import styles from "./Footer.module.css";
import "../common/tokens.css";

export function Footer() {
  const [email, setEmail] = useState("");

  function subscribe(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      showToast("Enter a valid email address.", "error");
      return;
    }
    showToast("You are subscribed to the newsletter.", "success");
    setEmail("");
  }

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div>
            <p className={styles.brand}>Funiro.</p>
            <p className={styles.address}>
              400 University Drive Suite 200 Coral Gables,
              <br />
              FL 33134 USA
            </p>
          </div>
          <div>
            <p className={styles.heading}>Links</p>
            <div className={styles.links}>
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <p className={styles.heading}>Help</p>
            <div className={styles.links}>
              <Link to="/checkout">Payment Options</Link>
              <Link to="/orders">Returns</Link>
              <Link to="/about">Privacy Policies</Link>
            </div>
          </div>
          <div>
            <p className={styles.heading}>Newsletter</p>
            <form className={styles.newsletter} onSubmit={subscribe}>
              <input
                type="email"
                required
                placeholder="Enter Your Email Address"
                aria-label="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit">SUBSCRIBE</button>
            </form>
          </div>
        </div>
        <p className={styles.legal}>2023 furino. All rights reverved</p>
      </div>
    </footer>
  );
}
