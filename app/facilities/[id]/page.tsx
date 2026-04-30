"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ErrorState from "@/app/components/ui/ErrorState";

type Facility = {
  id: number;
  name: string;
  description: string | null;
  openTime: string;
  closeTime: string;
};

type AvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateSlots(openTime: string, closeTime: string, date: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const [openH] = openTime.split(":").map(Number);
  const [closeH] = closeTime.split(":").map(Number);
  for (let h = openH; h < closeH; h++) {
    const start = `${date}T${String(h).padStart(2, "0")}:00:00.000Z`;
    const end = `${date}T${String(h + 1).padStart(2, "0")}:00:00.000Z`;
    slots.push({ start, end, available: true });
  }
  return slots;
}

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(getToday());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [availLoading, setAvailLoading] = useState(false);

  // Reservation form
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("sb_token");

  const fetchFacility = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/facilities/${id}`);
      if (res.status === 404) throw new Error("Obiekt nie istnieje.");
      if (!res.ok) throw new Error("Nie udało się załadować obiektu.");
      const data: Facility = await res.json();
      setFacility(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd serwera.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAvailability = useCallback(async () => {
    if (!facility) return;
    setAvailLoading(true);
    try {
      const res = await fetch(`/api/facilities/${id}/availability?date=${date}`);
      if (res.ok) {
        const data: AvailabilitySlot[] = await res.json();
        setSlots(data.length > 0 ? data : generateSlots(facility.openTime, facility.closeTime, date));
      } else {
        setSlots(generateSlots(facility.openTime, facility.closeTime, date));
      }
    } catch {
      setSlots(generateSlots(facility.openTime, facility.closeTime, date));
    } finally {
      setAvailLoading(false);
    }
  }, [id, date, facility]);

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  useEffect(() => {
    if (facility) fetchAvailability();
  }, [facility, fetchAvailability]);

  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (!slot.available) return;
    // Convert UTC ISO to local time for the form inputs
    const s = new Date(slot.start);
    const e = new Date(slot.end);
    const toLocalTime = (d: Date) =>
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setStartTime(toLocalTime(s));
    setEndTime(toLocalTime(e));
    setBookingError(null);
    setBookingSuccess(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      const token = localStorage.getItem("sb_token");
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const [y, mo, d] = date.split("-").map(Number);

      const startISO = new Date(y, mo - 1, d, sh, sm).toISOString();
      const endISO = new Date(y, mo - 1, d, eh, em).toISOString();

      if (new Date(startISO) >= new Date(endISO)) {
        throw new Error("Godzina zakończenia musi być późniejsza niż rozpoczęcia.");
      }

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          facilityId: Number(id),
          startTime: startISO,
          endTime: endISO,
        }),
      });

      const data = await res.json();

      if (res.status === 409) throw new Error("Ten termin jest już zajęty.");
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error(data.error || "Nie udało się zarezerwować terminu.");

      setBookingSuccess(true);
      setStartTime("");
      setEndTime("");
      fetchAvailability();
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Błąd serwera.");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatSlotTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (loading) return <LoadingSpinner message="Ładowanie obiektu..." />;
  if (error || !facility) return (
    <div className="section">
      <div className="container">
        <ErrorState message={error ?? "Nie znaleziono obiektu."} onRetry={fetchFacility} />
      </div>
    </div>
  );

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb */}
        <nav
          className="animate-fade-in"
          style={{ marginBottom: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}
        >
          <Link href="/facilities" style={{ color: "var(--accent-emerald)" }}>
            ← Wróć do listy
          </Link>
        </nav>

        {/* Facility Header */}
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: "2rem",
            background:
              "linear-gradient(135deg, var(--bg-card) 0%, rgba(16,185,129,0.05) 100%)",
            borderColor: "var(--border-accent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "var(--accent-emerald-glow)",
                border: "1px solid var(--border-accent)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                flexShrink: 0,
              }}
            >
              🏟
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>{facility.name}</h1>
              <p style={{ color: "var(--accent-emerald)", fontWeight: 600, margin: "0 0 0.5rem" }}>
                ⏰ Godziny otwarcia: {facility.openTime} – {facility.closeTime}
              </p>
              {facility.description && (
                <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>
                  {facility.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* ─── Availability ─── */}
          <div className="card animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}>📅 Dostępność</h2>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="availability-date" className="form-label">
                Wybierz datę
              </label>
              <input
                id="availability-date"
                type="date"
                className="form-input"
                value={date}
                min={getToday()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {availLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: "2px solid var(--border-default)",
                    borderTop: "2px solid var(--accent-emerald)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            ) : slots.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Brak dostępnych terminów w tym dniu.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    className={`slot-btn ${slot.available ? "slot-available" : "slot-taken"}`}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!slot.available}
                    title={slot.available ? "Kliknij, aby wybrać ten slot" : "Termin zajęty"}
                  >
                    {formatSlotTime(slot.start)} – {formatSlotTime(slot.end)}
                    {!slot.available && " ✗"}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--status-active)" }}>
                <span style={{ width: 10, height: 10, background: "var(--status-active)", borderRadius: "50%", display: "inline-block" }} />
                Wolny
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--status-cancelled)" }}>
                <span style={{ width: 10, height: 10, background: "var(--status-cancelled)", borderRadius: "50%", display: "inline-block" }} />
                Zajęty
              </span>
            </div>
          </div>

          {/* ─── Booking Form ─── */}
          <div className="card animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}>📋 Nowa Rezerwacja</h2>

            {!isLoggedIn && (
              <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
                <span>🔒</span>
                <span>
                  <Link href="/login" style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                    Zaloguj się
                  </Link>
                  , aby dokonać rezerwacji.
                </span>
              </div>
            )}

            {bookingSuccess && (
              <div className="alert alert-success animate-fade-in-fast" style={{ marginBottom: "1.25rem" }}>
                <span>✅</span>
                <span>Rezerwacja dodana pomyślnie!</span>
              </div>
            )}

            {bookingError && (
              <div className="alert alert-error animate-fade-in-fast" style={{ marginBottom: "1.25rem" }}>
                <span>⚠️</span>
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label htmlFor="booking-date" className="form-label">Data</label>
                <input
                  id="booking-date"
                  type="date"
                  className="form-input"
                  value={date}
                  min={getToday()}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div className="form-group">
                  <label htmlFor="booking-start" className="form-label">Godzina od</label>
                  <input
                    id="booking-start"
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    min={facility.openTime}
                    max={facility.closeTime}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-end" className="form-label">Godzina do</label>
                  <input
                    id="booking-end"
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={facility.openTime}
                    max={facility.closeTime}
                    required
                  />
                </div>
              </div>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "-0.5rem 0 0" }}>
                💡 Kliknij na dostępny slot po lewej, aby auto-uzupełnić godziny.
              </p>

              <button
                id="booking-submit"
                type="submit"
                className="btn btn-primary"
                disabled={bookingLoading || !isLoggedIn}
                style={{ width: "100%", padding: "0.75rem" }}
              >
                {bookingLoading ? (
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
                    Rezerwowanie...
                  </>
                ) : (
                  "✅ Zarezerwuj Termin"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
