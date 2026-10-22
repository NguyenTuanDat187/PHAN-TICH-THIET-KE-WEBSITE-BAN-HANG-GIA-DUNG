import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, showToast } from "../../components/common/index.ts";
import { PageBanner } from "../../components/layout/PageBanner.tsx";

const userKey = "furniro-user";

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const user = {
      name: String(data.get("name") || "Customer"),
      email: String(data.get("email") || ""),
    };
    localStorage.setItem(userKey, JSON.stringify(user));
    showToast(mode === "login" ? "Signed in." : "Account created.", "success");
    navigate("/account");
  }

  return (
    <>
      <PageBanner title={mode === "login" ? "Login" : "Register"} />
      <form
        onSubmit={submit}
        className="wrap"
        style={{ maxWidth: 480, margin: "64px auto", display: "grid", gap: 16 }}
      >
        {mode === "register" ? (
          <TextInput label="Name" name="name" required fullWidth />
        ) : null}
        <TextInput label="Email" name="email" type="email" required fullWidth />
        <TextInput label="Password" name="password" type="password" required fullWidth />
        <Button type="submit" variant="primary">
          {mode === "login" ? "Log in" : "Register"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{ border: 0, background: "transparent", cursor: "pointer", font: "inherit" }}
        >
          {mode === "login" ? "Create an account" : "Already have an account? Log in"}
        </button>
      </form>
    </>
  );
}
