import Link from "next/link";

export default function EmptyState({
  icon = "📭",
  title = "Brak danych",
  description = "Nie znaleziono żadnych elementów.",
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "4rem 2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "3.5rem", lineHeight: 1, opacity: 0.7 }}>{icon}</div>
      <div>
        <h3 style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}>{title}</h3>
        <p style={{ color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto" }}>{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
