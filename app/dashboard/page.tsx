"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ErrorState from "@/app/components/ui/ErrorState";
import EmptyState from "@/app/components/ui/EmptyState";
import { useReservations } from "@/app/hooks/useReservations";
import { ApiError, type Reservation } from "@/app/lib/api-client";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: Reservation["status"]) {
  switch (status) {
    case "ACTIVE": return { label: "Aktywna", cls: "badge-active", icon: "✅" };
    case "CANCELLED_BY_USER": return { label: "Anulowana przez Ciebie", cls: "badge-cancelled", icon: "❌" };
    case "CANCELLED_BY_ADMIN": return { label: "Anulowana przez admina", cls: "badge-cancelled", icon: "❌" };
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { reservations, loading, error, refetch, cancelReservation } = useReservations();

  useEffect(() => {
    const stored = localStorage.getItem("sb_auth");
    if (!stored) { router.push("/login"); return; }
    const auth = JSON.parse(stored);
    setUserEmail(auth.email);
  }, [router]);

  const handleCancel = async (id: number) => {
    if (!confirm("Czy na pewno chcesz anulować tę rezerwację?")) return;
    setCancellingId(id);
    setCancelError(null);
    try {
      await cancelReservation(id);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Błąd anulowania.";
      setCancelError(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const active = reservations.filter((r) => r.status === "ACTIVE");
  const cancelled = reservations.filter((r) => r.status !== "ACTIVE");

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="animate-fade-in" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: 48, height: 48,
                background: "linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.25rem", fontWeight: 700, color: "#fff",
              }}
            >
              {userEmail ? userEmail[0].toUpperCase() : "👤"}
            </div>
            <div>
              <h1 style={{ fontSize: "1.875rem" }}>Moje Rezerwacje</h1>
              {userEmail && <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>{userEmail}</p>}
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>Zarządzaj swoimi rezerwacjami obiektów sportowych.</p>
        </div>

        {cancelError && (
          <div className="alert alert-error animate-fade-in-fast" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span><span>{cancelError}</span>
          </div>
        )}

        {/* States */}
        {loading && <LoadingSpinner message="Ładowanie rezerwacji..." />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && reservations.length === 0 && (
          <EmptyState
            icon="📅"
            title="Brak rezerwacji"
            description="Nie masz jeszcze żadnych rezerwacji. Znajdź boisko i zarezerwuj swój pierwszy termin!"
            actionLabel="🏟 Przeglądaj Boiska"
            actionHref="/facilities"
          />
        )}

        {!loading && !error && reservations.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {/* Active */}
            {active.length > 0 && (
              <section className="animate-fade-in">
                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 8, height: 8, background: "var(--status-active)", borderRadius: "50%", display: "inline-block" }} />
                  Aktywne ({active.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {active.map((r) => (
                    <ReservationCard key={r.id} reservation={r} onCancel={handleCancel} cancelling={cancellingId === r.id} />
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled */}
            {cancelled.length > 0 && (
              <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 8, height: 8, background: "var(--text-muted)", borderRadius: "50%", display: "inline-block" }} />
                  Historia ({cancelled.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", opacity: 0.7 }}>
                  {cancelled.map((r) => (
                    <ReservationCard key={r.id} reservation={r} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationCard({
  reservation,
  onCancel,
  cancelling = false,
}: {
  reservation: Reservation;
  onCancel?: (id: number) => void;
  cancelling?: boolean;
}) {
  const st = statusLabel(reservation.status);
  return (
    <div
      className="card"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", padding: "1.25rem 1.5rem" }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div
          style={{
            width: 44, height: 44,
            background: reservation.status === "ACTIVE" ? "var(--accent-emerald-glow)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${reservation.status === "ACTIVE" ? "var(--border-accent)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-md)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem", flexShrink: 0,
          }}
        >
          🏟
        </div>
        <div>
          <Link
            href={`/facilities/${reservation.facilityId}`}
            style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", textDecoration: "none" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent-emerald)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
          >
            {reservation.facility?.name ?? `Obiekt #${reservation.facilityId}`}
          </Link>
          <p style={{ margin: "0.2rem 0 0.1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            📅 {formatDateTime(reservation.startTime)} – {new Date(reservation.endTime).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </p>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Zarezerwowano: {formatDate(reservation.createdAt)}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span className={`badge ${st.cls}`}>{st.icon} {st.label}</span>
        {reservation.status === "ACTIVE" && onCancel && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onCancel(reservation.id)}
            disabled={cancelling}
          >
            {cancelling ? "..." : "✕ Anuluj"}
          </button>
        )}
      </div>
    </div>
  );
}
