"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ErrorState from "@/app/components/ui/ErrorState";
import { useFacility } from "@/app/hooks/useFacility";
import { reservationsApi, ApiError, type AvailabilitySlot } from "@/app/lib/api-client";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateSlots(openTime: string, closeTime: string, date: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const [openH] = openTime.split(":").map(Number);
  const [closeH] = closeTime.split(":").map(Number);
  for (let h = openH; h < closeH; h++) {
    const pad = (n: number) => String(n).padStart(2, "0");
    slots.push({
      start: `${date}T${pad(h)}:00:00.000Z`,
      end: `${date}T${pad(h + 1)}:00:00.000Z`,
      available: true,
    });
  }
  return slots;
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { facility, loadingFacility, facilityError, slots, loadingSlots, refetchFacility, fetchAvailability } =
    useFacility(id);

  const [date, setDate] = useState(getToday());
  const [displaySlots, setDisplaySlots] = useState<AvailabilitySlot[]>([]);

  // Booking form state
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("sb_token");

  // Load availability when date or facility changes
  useEffect(() => {
    if (facility) {
      fetchAvailability(date).then(() => {});
    }
  }, [date, facility, fetchAvailability]);

  // When slots come in from hook, show them or fall back to generated slots
  useEffect(() => {
    if (!facility) return;
    if (slots.length > 0) {
      setDisplaySlots(slots);
    } else if (!loadingSlots) {
      setDisplaySlots(generateSlots(facility.openTime, facility.closeTime, date));
    }
  }, [slots, loadingSlots, facility, date]);

  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (!slot.available) return;
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
    if (!isLoggedIn) { router.push("/login"); return; }
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const [y, mo, d] = date.split("-").map(Number);

      const startISO = new Date(y, mo - 1, d, sh, sm).toISOString();
      const endISO = new Date(y, mo - 1, d, eh, em).toISOString();

      if (new Date(startISO) >= new Date(endISO)) {
        throw new Error("Godzina zakończenia musi być późniejsza niż rozpoczęcia.");
      }

      await reservationsApi.create({ facilityId: id, startTime: startISO, endTime: endISO });
      setBookingSuccess(true);
      setStartTime("");
      setEndTime("");
      fetchAvailability(date);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : "Błąd serwera.");
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingFacility) return <LoadingSpinner message="Ładowanie obiektu..." />;
  if (facilityError || !facility) return (
    <div className="section">
      <div className="container">
        <ErrorState message={facilityError ?? "Nie znaleziono obiektu."} onRetry={refetchFacility} />
      </div>
    </div>
  );

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="animate-fade-in" style={{ marginBottom: "2rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          <Link href="/facilities" style={{ color: "var(--accent-emerald)" }}>← Wróć do listy</Link>
        </nav>

        {/* Facility Header Card */}
        <div
          className="card animate-fade-in"
          style={{ marginBottom: "2rem", background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(16,185,129,0.05) 100%)", borderColor: "var(--border-accent)" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ width: 64, height: 64, background: "var(--accent-emerald-glow)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
              🏟
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>{facility.name}</h1>
              <p style={{ color: "var(--accent-emerald)", fontWeight: 600, margin: "0 0 0.5rem" }}>
                ⏰ Godziny otwarcia: {facility.openTime} – {facility.closeTime}
              </p>
              {facility.description && (
                <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>{facility.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

          {/* ─ Availability ─ */}
          <div className="card animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}>📅 Dostępność</h2>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="availability-date" className="form-label">Wybierz datę</label>
              <input
                id="availability-date"
                type="date"
                className="form-input"
                value={date}
                min={getToday()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {loadingSlots ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
                <div style={{ width: 28, height: 28, border: "2px solid var(--border-default)", borderTop: "2px solid var(--accent-emerald)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : displaySlots.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Brak dostępnych terminów w tym dniu.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {displaySlots.map((slot) => (
                  <button
                    key={slot.start}
                    className={`slot-btn ${slot.available ? "slot-available" : "slot-taken"}`}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!slot.available}
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

          {/* ─ Booking Form ─ */}
          <div className="card animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}>📋 Nowa Rezerwacja</h2>

            {!isLoggedIn && (
              <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
                <span>🔒</span>
                <span>
                  <Link href="/login" style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>Zaloguj się</Link>, aby dokonać rezerwacji.
                </span>
              </div>
            )}

            {bookingSuccess && (
              <div className="alert alert-success animate-fade-in-fast" style={{ marginBottom: "1.25rem" }}>
                <span>✅</span><span>Rezerwacja dodana pomyślnie!</span>
              </div>
            )}

            {bookingError && (
              <div className="alert alert-error animate-fade-in-fast" style={{ marginBottom: "1.25rem" }}>
                <span>⚠️</span><span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label htmlFor="booking-date" className="form-label">Data</label>
                <input id="booking-date" type="date" className="form-input" value={date} min={getToday()} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label htmlFor="booking-start" className="form-label">Godzina od</label>
                  <input id="booking-start" type="time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} min={facility.openTime} max={facility.closeTime} required />
                </div>
                <div className="form-group">
                  <label htmlFor="booking-end" className="form-label">Godzina do</label>
                  <input id="booking-end" type="time" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} min={facility.openTime} max={facility.closeTime} required />
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
                    <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Rezerwowanie...
                  </>
                ) : "✅ Zarezerwuj Termin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
