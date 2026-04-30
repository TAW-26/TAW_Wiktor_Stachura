"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

export default function RegisterPage() {
  const { register, loading, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirm) {
      setLocalError("Hasła nie są identyczne.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    try {
      await register(email, password);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background:
          "radial-gradient(ellipse 70% 70% at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 60%)",
      }}
    >
      <div
        className="card animate-fade-in"
        style={{ width: "100%", maxWidth: 440 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.5rem", textDecoration: "none" }}
          >
            <span style={{ fontSize: "1.5rem" }}>⚡</span>
            <span className="gradient-text" style={{ fontWeight: 800, fontSize: "1.25rem" }}>
              SportBook
            </span>
          </Link>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Utwórz konto</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", margin: 0 }}>
            Dołącz i zarezerwuj pierwsze boisko.
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in-fast" style={{ marginBottom: "1.25rem" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Adres e-mail
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              Hasło
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Min. 8 znaków"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  padding: "0.25rem",
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">
              Potwierdź hasło
            </label>
            <input
              id="reg-confirm"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Powtórz hasło"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirm && password !== confirm && (
              <span className="form-error">Hasła nie są identyczne.</span>
            )}
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading || (confirm.length > 0 && password !== confirm)}
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "0.5rem" }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Rejestracja...
              </>
            ) : (
              "→ Zarejestruj się"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          Masz już konto?{" "}
          <Link href="/login" style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
