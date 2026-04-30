"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ErrorState from "@/app/components/ui/ErrorState";
import EmptyState from "@/app/components/ui/EmptyState";

type Facility = {
  id: number;
  name: string;
  description: string | null;
  openTime: string;
  closeTime: string;
  createdAt: string;
};

type Reservation = {
  id: number;
  facilityId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: "ACTIVE" | "CANCELLED_BY_USER" | "CANCELLED_BY_ADMIN";
  createdAt: string;
  user?: { email: string };
  facility?: { name: string };
};

type Tab = "facilities" | "reservations";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("sb_token") : null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("facilities");

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem("sb_auth");
    if (!stored) { router.push("/login"); return; }
    const auth = JSON.parse(stored);
    if (auth.role !== "ADMIN") { router.push("/dashboard"); }
  }, [router]);

  return (
    <div className="section">
      <div className="container">
        <div className="animate-fade-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ marginBottom: "0.5rem" }}>
            🛡 Panel{" "}
            <span className="gradient-text">Administratora</span>
          </h1>
          <p>Zarządzaj obiektami i rezerwacjami w systemie.</p>
        </div>

        {/* Tabs */}
        <div className="tabs animate-fade-in" style={{ marginBottom: "2rem", maxWidth: 400 }}>
          <button
            className={`tab-btn ${tab === "facilities" ? "active" : ""}`}
            onClick={() => setTab("facilities")}
          >
            🏟 Boiska
          </button>
          <button
            className={`tab-btn ${tab === "reservations" ? "active" : ""}`}
            onClick={() => setTab("reservations")}
          >
            📅 Rezerwacje
          </button>
        </div>

        {tab === "facilities" && <AdminFacilitiesTab />}
        {tab === "reservations" && <AdminReservationsTab />}
      </div>
    </div>
  );
}

/* ─── Facilities Tab ─────────────────────────────────────────── */
function AdminFacilitiesTab() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ name: "", description: "", openTime: "08:00", closeTime: "22:00" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/facilities");
      if (!res.ok) throw new Error("Nie udało się pobrać boisk.");
      setFacilities(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd serwera.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFacilities(); }, [fetchFacilities]);

  const openAdd = () => {
    setEditingFacility(null);
    setFormData({ name: "", description: "", openTime: "08:00", closeTime: "22:00" });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (f: Facility) => {
    setEditingFacility(f);
    setFormData({ name: f.name, description: f.description ?? "", openTime: f.openTime, closeTime: f.closeTime });
    setFormError(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const token = getToken();
      const url = editingFacility ? `/api/facilities/${editingFacility.id}` : "/api/facilities";
      const method = editingFacility ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd zapisu.");
      setShowForm(false);
      fetchFacilities();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Błąd.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Usunąć boisko "${name}"? Wszystkie rezerwacje zostaną usunięte.`)) return;
    setDeletingId(id);
    try {
      const token = getToken();
      const res = await fetch(`/api/facilities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Nie udało się usunąć.");
      setFacilities((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Add button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <button className="btn btn-primary" onClick={openAdd}>
          + Dodaj nowe boisko
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div
          className="card animate-fade-in"
          style={{ marginBottom: "1.5rem", borderColor: "var(--border-accent)" }}
        >
          <h3 style={{ marginBottom: "1.25rem" }}>
            {editingFacility ? "✏ Edytuj boisko" : "➕ Nowe boisko"}
          </h3>
          {formError && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
              <span>⚠️</span><span>{formError}</span>
            </div>
          )}
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="admin-name" className="form-label">Nazwa boiska *</label>
              <input
                id="admin-name"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="np. Boisko Miejskie nr 1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-desc" className="form-label">Opis</label>
              <textarea
                id="admin-desc"
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Opis obiektu..."
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label htmlFor="admin-open" className="form-label">Godzina otwarcia</label>
                <input id="admin-open" type="time" className="form-input" value={formData.openTime}
                  onChange={(e) => setFormData((p) => ({ ...p, openTime: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="admin-close" className="form-label">Godzina zamknięcia</label>
                <input id="admin-close" type="time" className="form-input" value={formData.closeTime}
                  onChange={(e) => setFormData((p) => ({ ...p, closeTime: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Anuluj
              </button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? "Zapisywanie..." : editingFacility ? "💾 Zapisz zmiany" : "➕ Dodaj boisko"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* States */}
      {loading && <LoadingSpinner message="Ładowanie boisk..." />}
      {!loading && error && <ErrorState message={error} onRetry={fetchFacilities} />}
      {!loading && !error && facilities.length === 0 && (
        <EmptyState icon="🏟" title="Brak boisk" description="Dodaj pierwsze boisko używając przycisku powyżej." />
      )}

      {/* Table */}
      {!loading && !error && facilities.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nazwa</th>
                <th>Godziny</th>
                <th>Dodano</th>
                <th style={{ textAlign: "right" }}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f.id}>
                  <td style={{ color: "var(--text-muted)", width: 40 }}>#{f.id}</td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{f.name}</p>
                    {f.description && (
                      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {f.description.slice(0, 60)}{f.description.length > 60 ? "..." : ""}
                      </p>
                    )}
                  </td>
                  <td style={{ color: "var(--accent-emerald)", fontWeight: 500 }}>
                    {f.openTime} – {f.closeTime}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                    {new Date(f.createdAt).toLocaleDateString("pl-PL")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(f)}>
                        ✏ Edytuj
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(f.id, f.name)}
                        disabled={deletingId === f.id}
                      >
                        {deletingId === f.id ? "..." : "🗑 Usuń"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Reservations Tab ───────────────────────────────────────── */
function AdminReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch("/api/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Nie udało się pobrać rezerwacji.");
      setReservations(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd serwera.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleCancel = async (id: number) => {
    if (!confirm("Anulować tę rezerwację jako administrator?")) return;
    setCancellingId(id);
    try {
      const token = getToken();
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Nie udało się anulować.");
      setReservations((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: "CANCELLED_BY_ADMIN" } : r)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Ładowanie rezerwacji..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReservations} />;
  if (reservations.length === 0) return (
    <EmptyState icon="📅" title="Brak rezerwacji" description="W systemie nie ma jeszcze żadnych rezerwacji." />
  );

  return (
    <div className="animate-fade-in">
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Łącznie: {reservations.length} rezerwacji
      </p>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Użytkownik</th>
              <th>Obiekt</th>
              <th>Termin</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td style={{ color: "var(--text-muted)", width: 40 }}>#{r.id}</td>
                <td style={{ fontSize: "0.875rem" }}>{r.user?.email ?? `User #${r.userId}`}</td>
                <td style={{ fontWeight: 500 }}>{r.facility?.name ?? `Obiekt #${r.facilityId}`}</td>
                <td style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  <span>{formatDateTime(r.startTime)}</span>
                  <br />
                  <span style={{ color: "var(--text-muted)" }}>→ {new Date(r.endTime).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</span>
                </td>
                <td>
                  <span className={`badge ${r.status === "ACTIVE" ? "badge-active" : "badge-cancelled"}`}>
                    {r.status === "ACTIVE" ? "✅ Aktywna" : "❌ Anulowana"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {r.status === "ACTIVE" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(r.id)}
                        disabled={cancellingId === r.id}
                      >
                        {cancellingId === r.id ? "..." : "✕ Anuluj"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
