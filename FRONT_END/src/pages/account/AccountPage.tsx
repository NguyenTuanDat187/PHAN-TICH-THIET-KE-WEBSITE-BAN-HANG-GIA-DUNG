import { Link } from "react-router-dom";
import { Button } from "../../components/common/index.ts";
import { PageBanner } from "../../components/layout/PageBanner.tsx";

const userKey = "furniro-user";

export function AccountPage() {
  const raw = localStorage.getItem(userKey);
  const user = raw ? (JSON.parse(raw) as { name: string; email: string }) : null;

  if (!user) {
    return (
      <>
        <PageBanner title="My account" />
        <div className="wrap" style={{ padding: "64px 0", textAlign: "center" }}>
          <p>Sign in to see your profile, addresses, and orders.</p>
          <Button variant="primary">
            <Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>
              Log in
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner title="My account" />
      <div className="wrap" style={{ padding: "64px 0", display: "grid", gap: 12, maxWidth: 640 }}>
        <h2 style={{ margin: 0 }}>{user.name}</h2>
        <p>{user.email}</p>
        <p>Address: 400 University Drive Suite 200, Coral Gables, FL 33134</p>
        <Link to="/orders">View orders</Link>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem(userKey);
            window.location.assign("/");
          }}
        >
          Log out
        </Button>
      </div>
    </>
  );
}
