export default function SkeletonCard() {
  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="skeleton" style={{ height: 16, width: "70%", borderRadius: "var(--radius-sm)" }} />
          <div className="skeleton" style={{ height: 12, width: "40%", borderRadius: "var(--radius-sm)" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div className="skeleton" style={{ height: 12, width: "100%", borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton" style={{ height: 12, width: "80%", borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton" style={{ height: 12, width: "60%", borderRadius: "var(--radius-sm)" }} />
      </div>
      <div className="skeleton" style={{ height: 36, borderRadius: "var(--radius-md)" }} />
    </div>
  );
}
