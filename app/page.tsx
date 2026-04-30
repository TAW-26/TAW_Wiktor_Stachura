import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SportBook — Zarezerwuj Boisko Online",
  description:
    "Przeglądaj dostępność lokalnych obiektów sportowych i rezerwuj je online w kilka sekund. Bez kolejek.",
};

const STATS = [
  { icon: "🏟", value: "12+", label: "Obiektów sportowych" },
  { icon: "📅", value: "500+", label: "Rezerwacji miesięcznie" },
  { icon: "⭐", value: "98%", label: "Satysfakcji użytkowników" },
];

const FEATURES = [
  {
    icon: "🔍",
    title: "Sprawdź dostępność",
    description: "Przeglądaj wolne terminy w czasie rzeczywistym. Żadnych niespodzianek.",
  },
  {
    icon: "✅",
    title: "Zarezerwuj w chwilę",
    description: "Wybierz termin i potwierdź rezerwację w kilka kliknięć.",
  },
  {
    icon: "📲",
    title: "Zarządzaj rezerwacjami",
    description: "Przeglądaj i anuluj swoje rezerwacje w panelu użytkownika.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(16,185,129,0.08) 0%, transparent 60%), var(--bg-base)",
        }}
      >
        {/* Background grid pattern */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.4,
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            className="animate-fade-in"
            style={{
              maxWidth: 700,
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Tag */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.875rem",
                background: "var(--accent-emerald-glow)",
                border: "1px solid var(--border-accent)",
                borderRadius: "999px",
                width: "fit-content",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--accent-emerald)",
                letterSpacing: "0.05em",
              }}
            >
              ⚡ Rezerwacja Online — Szybko i Wygodnie
            </div>

            {/* Heading */}
            <h1 style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              Twoje miejsce na{" "}
              <span className="gradient-text">aktywny wypoczynek</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                maxWidth: 560,
              }}
            >
              Zarezerwuj boisko lub obiekt sportowy w kilka sekund — bez kolejek, bez telefonów.
              Sprawdź dostępność i graj już dziś.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/facilities" className="btn btn-primary btn-lg">
                🏟 Przeglądaj Boiska
              </Link>
              <Link href="/register" className="btn btn-secondary btn-lg">
                Zarejestruj się →
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative glow blobs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      </section>

      {/* ─── Stats ────────────────────────────────────────── */}
      <section style={{ padding: "4rem 0", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div
            className="animate-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="card"
                style={{ textAlign: "center", padding: "2rem 1.5rem" }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{stat.icon}</div>
                <div
                  className="gradient-text"
                  style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}
                >
                  {stat.value}
                </div>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.9375rem" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2>
              Jak to <span className="gradient-text">działa?</span>
            </h2>
            <p style={{ marginTop: "0.75rem", fontSize: "1.0625rem" }}>
              Trzy proste kroki dzielą Cię od wolnego terminu na boisku.
            </p>
          </div>

          <div className="grid-cards animate-stagger">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="card" style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "1.25rem",
                    width: 28,
                    height: 28,
                    background: "var(--accent-emerald-glow)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--accent-emerald)",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{feature.icon}</div>
                <h3 style={{ marginBottom: "0.5rem" }}>{feature.title}</h3>
                <p style={{ fontSize: "0.9375rem", lineHeight: 1.6 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────── */}
      <section
        style={{
          padding: "5rem 0",
          borderTop: "1px solid var(--border-subtle)",
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)",
        }}
      >
        <div
          className="container"
          style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
        >
          <h2 style={{ letterSpacing: "-0.03em" }}>
            Gotowy na <span className="gradient-text">grę?</span>
          </h2>
          <p style={{ fontSize: "1.0625rem", maxWidth: 480 }}>
            Dołącz do setek aktywnych użytkowników i zarezerwuj swoje boisko już teraz.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Utwórz konto za darmo
            </Link>
            <Link href="/facilities" className="btn btn-secondary btn-lg">
              Przeglądaj bez logowania
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
