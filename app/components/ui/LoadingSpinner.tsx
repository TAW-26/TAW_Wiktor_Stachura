export default function LoadingSpinner({ message = "Ładowanie..." }: { message?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "4rem 2rem",
        color: "var(--text-secondary)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "3px solid var(--border-default)",
          borderTop: "3px solid var(--accent-emerald)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: "0.9375rem", margin: 0 }}>{message}</p>
    </div>
  );
}
