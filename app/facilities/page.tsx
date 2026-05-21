"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SkeletonCard from "@/app/components/ui/SkeletonCard";
import ErrorState from "@/app/components/ui/ErrorState";
import EmptyState from "@/app/components/ui/EmptyState";
import { useFacilities } from "@/app/hooks/useFacilities";
import type { Facility } from "@/app/lib/api-client";

export default function FacilitiesPage() {
  const { facilities, loading, error, refetch } = useFacilities();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return facilities;
    }

    const query = search.toLowerCase();
    return facilities.filter(
      (facility) =>
        facility.name.toLowerCase().includes(query) ||
        (facility.description ?? "").toLowerCase().includes(query)
    );
  }, [search, facilities]);

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "0.5rem" }}>
              🏟 Obiekty{" "}
              <span className="gradient-text">Sportowe</span>
            </h1>
            <p style={{ fontSize: "1.0625rem" }}>
              Znajdź i zarezerwuj swoje ulubione miejsce do gry.
            </p>
          </div>

          <div style={{ position: "relative", minWidth: 260 }}>
            <span
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1rem",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              id="facilities-search"
              type="search"
              className="form-input"
              placeholder="Szukaj boiska..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>

        {/* Loading state — 6 skeleton cards */}
        {loading && (
          <div className="grid-cards animate-stagger">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <ErrorState message={error} onRetry={refetch} />
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon="🏟"
            title={search ? "Brak wyników wyszukiwania" : "Brak dostępnych obiektów"}
            description={
              search
                ? `Nie znaleziono boisk pasujących do „${search}".`
                : "Administratorzy jeszcze nie dodali żadnych obiektów."
            }
          />
        )}

        {/* Facilities grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                marginBottom: "1.5rem",
              }}
            >
              {filtered.length === 1 ? "1 obiekt" : `${filtered.length} obiektów`}
              {search && ` pasujących do „${search}"`}
            </p>
            <div className="grid-cards animate-stagger">
              {filtered.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: "var(--accent-emerald-glow)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.375rem",
            flexShrink: 0,
          }}
        >
          🏟
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{facility.name}</h3>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--accent-emerald)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            ⏰ {facility.openTime} – {facility.closeTime}
          </p>
        </div>
      </div>

      {facility.description && (
        <p
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {facility.description}
        </p>
      )}

      <div
        style={{
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "auto",
        }}
      >
        <Link
          href={`/facilities/${facility.id}`}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          → Szczegóły i Rezerwacja
        </Link>
      </div>
    </div>
  );
}
