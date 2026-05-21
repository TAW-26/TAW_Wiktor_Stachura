"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type AuthState = {
  email: string;
  role: "USER" | "ADMIN";
} | null;

export default function Navbar() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateAuth = () => {
      try {
        const stored = localStorage.getItem("sb_auth");
        if (stored) setAuth(JSON.parse(stored));
        else setAuth(null);
      } catch {
        setAuth(null);
      }
    };
    updateAuth();
    window.addEventListener("sb_auth_change", updateAuth);
    return () => window.removeEventListener("sb_auth_change", updateAuth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("sb_auth");
    localStorage.removeItem("sb_token");
    window.dispatchEvent(new Event("sb_auth_change"));
    setDropdownOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="navbar">
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚡</span>
          <span
            className="gradient-text"
            style={{ fontWeight: 800, fontSize: "1.125rem", letterSpacing: "-0.02em" }}
          >
            SportBook
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          className="desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
        >
          <NavLink href="/facilities" active={isActive("/facilities")}>
            🏟 Boiska
          </NavLink>

          {auth && (
            <NavLink href="/dashboard" active={isActive("/dashboard")}>
              📅 Rezerwacje
            </NavLink>
          )}

          {auth?.role === "ADMIN" && (
            <NavLink href="/admin" active={isActive("/admin")}>
              🛡 Admin
            </NavLink>
          )}
        </div>

        {/* Auth / User area */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {auth ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 0.875rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "999px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all var(--transition)",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    background: "linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {auth.email[0].toUpperCase()}
                </span>
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {auth.email}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>▼</span>
              </button>

              {dropdownOpen && (
                <div
                  className="animate-fade-in-fast"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    minWidth: 180,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-card)",
                    overflow: "hidden",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Zalogowany jako</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                      {auth.role === "ADMIN" ? "🛡 Administrator" : "👤 Użytkownik"}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    style={{
                      display: "block",
                      padding: "0.625rem 1rem",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      transition: "all var(--transition)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }}
                  >
                    📅 Moje Rezerwacje
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.625rem 1rem",
                      fontSize: "0.875rem",
                      color: "var(--status-cancelled)",
                      textAlign: "left",
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      fontFamily: "inherit",
                      borderTop: "1px solid var(--border-subtle)",
                      transition: "all var(--transition)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--status-cancelled-bg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "";
                    }}
                  >
                    🚪 Wyloguj się
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Zaloguj się
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Zarejestruj się
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              padding: "0.375rem",
              background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="animate-fade-in-fast"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
            padding: "1rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/facilities" style={{ padding: "0.5rem 0", color: "var(--text-secondary)" }}>
              🏟 Boiska
            </Link>
            {auth && (
              <Link href="/dashboard" style={{ padding: "0.5rem 0", color: "var(--text-secondary)" }}>
                📅 Rezerwacje
              </Link>
            )}
            {auth?.role === "ADMIN" && (
              <Link href="/admin" style={{ padding: "0.5rem 0", color: "var(--text-secondary)" }}>
                🛡 Admin
              </Link>
            )}
            {!auth && (
              <>
                <Link href="/login" style={{ padding: "0.5rem 0", color: "var(--text-secondary)" }}>
                  Zaloguj się
                </Link>
                <Link href="/register" style={{ padding: "0.5rem 0", color: "var(--accent-emerald)" }}>
                  Zarejestruj się
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "0.375rem 0.875rem",
        borderRadius: "var(--radius-md)",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: active ? "var(--accent-emerald)" : "var(--text-secondary)",
        background: active ? "var(--accent-emerald-glow)" : "transparent",
        transition: "all var(--transition)",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }
      }}
    >
      {children}
    </Link>
  );
}
