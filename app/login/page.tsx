"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // Error is handled in the hook
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
          "radial-gradient(ellipse 70% 70% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)",
      }}
    >
      <div
        className="card animate-fade-in"
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              textDecoration: "none",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>⚡</span>
            <span
              className="gradient-text"
              style={{ fontWeight: 800, fontSize: "1.25rem" }}
            >
              SportBook
            </span>
          </Link>
          <h1
            style={{
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
              color: "var(--text-primary)",
            }}
          >
            Zaloguj się
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", margin: 0 }}>
            Witaj z powrotem! Wpisz swoje dane.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error animate-fade-in-fast" style={{ marginBottom: "1.25rem" }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Adres e-mail
            </label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="form-label">
              Hasło
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
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
                Logowanie...
              </>
            ) : (
              "→ Zaloguj się"
            )}
          </button>
        </form>

        {/* Footer link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          Nie masz konta?{" "}
          <Link
            href="/register"
            style={{ color: "var(--accent-emerald)", fontWeight: 600 }}
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}
