export default function ErrorState({
  message = "Wystąpił błąd. Spróbuj ponownie.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
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
      <div style={{ fontSize: "3rem", lineHeight: 1 }}>⚠️</div>
      <div>
        <h3 style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}>Coś poszło nie tak</h3>
        <p style={{ color: "var(--text-secondary)", maxWidth: 420, margin: "0 auto" }}>{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary">
          🔄 Spróbuj ponownie
        </button>
      )}
    </div>
  );
}
