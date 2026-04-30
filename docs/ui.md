# UI — Makiety i Opis Layoutu

**Projekt:** SportBook — System Rezerwacji Boisk i Obiektów Sportowych  
**Technologie:** Next.js 16, Tailwind CSS v4, TypeScript  
**Design:** Dark-first, glassmorphism, akcent emerald/cyan

---

## 1. Globalny Layout (Shared)

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR                                                     │
│  ⚡ SportBook    [Boiska] [Rezerwacje]   [Zaloguj] / [👤]  │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│                    <PAGE CONTENT>                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
│  FOOTER                                                     │
│  © 2026 SportBook · Wiktor Stachura                        │
└─────────────────────────────────────────────────────────────┘
```

### Navbar — Stany

| Stan | Widok |
|------|-------|
| Niezalogowany | Logo \| Boiska \| **Zaloguj** \| **Zarejestruj** |
| Zalogowany (USER) | Logo \| Boiska \| **Moje Rezerwacje** \| avatar dropdown |
| Zalogowany (ADMIN) | Logo \| Boiska \| **Rezerwacje** \| **Admin** \| avatar dropdown |

**Kolory:**
- Tło navbar: `rgba(10, 15, 30, 0.9)` z `backdrop-filter: blur(12px)`
- Logo: gradient emerald→cyan
- Aktywny link: emerald `#10b981`

---

## 2. Strona Główna (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│  HERO SECTION                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │   Gradient overlay (navy → slate)                     │ │
│  │                                                       │ │
│  │   ⚡ SPORTBOOK                                        │ │
│  │   Twoje miejsce na aktywny wypoczynek                 │ │
│  │                                                       │ │
│  │   Zarezerwuj boisko w kilka sekund — bez kolejek.    │ │
│  │                                                       │ │
│  │   [🏟  Przeglądaj Boiska]  [→ Zarejestruj się]       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STATYSTYKI (3 karty)                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  🏟 12+     │  │  📅 500+    │  │  ⭐ 98%     │        │
│  │  Boisk      │  │  Rezerwacji │  │  Satysfakcji│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WYRÓŻNIONE BOISKA                                          │
│  "Dostępne Obiekty"                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 🏟 Boisko A │  │ 🏟 Boisko B │  │ 🏟 Boisko C │        │
│  │ opis...     │  │ opis...     │  │ opis...     │        │
│  │ 08:00-22:00 │  │ 09:00-21:00 │  │ 07:00-23:00 │        │
│  │ [Zarezerwuj]│  │ [Zarezerwuj]│  │ [Zarezerwuj]│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CTA SEKCJA                                                 │
│  Gotowy na grę?                                             │
│  [Zaloguj się i zarezerwuj →]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Lista Boisk (`/facilities`)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                     │
│  🏟 Obiekty Sportowe          [🔍 Szukaj boiska...]         │
│  Znajdź i zarezerwuj swoje ulubione miejsce.                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  GRID KART (responsive: 1 → 2 → 3 kolumny)                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🏟  Boisko Miejskie nr 1                             │ │
│  │  Świetnie wyposażone boisko do piłki nożnej...        │ │
│  │  ⏰ 08:00 – 22:00                                     │ │
│  │                              [→ Szczegóły i Rezerwacja]│ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ...kolejne karty...                                  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

STANY:
  [loading]  → 6 kart-szkieletów z animacją shimmer
  [error]    → ikona ⚠, komunikat, przycisk "Spróbuj ponownie"
  [empty]    → ikona 🏟, komunikat "Brak dostępnych obiektów"
```

---

## 4. Szczegóły Boiska / Formularz Rezerwacji (`/facilities/[id]`)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Powrót do listy                                          │
│                                                             │
│  🏟 NAZWA BOISKA                                            │
│  ⏰ Godziny: 08:00 – 22:00                                  │
│  📄 Opis boiska...                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  LEWA KOLUMNA: Dostępność                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  📅 Wybierz datę: [input type=date]                   │ │
│  │                                                       │ │
│  │  Dostępne sloty:                                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │ │
│  │  │ 08-09 ✓  │ │ 09-10 ✗  │ │ 10-11 ✓  │  ...       │ │
│  │  └──────────┘ └──────────┘ └──────────┘             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  PRAWA KOLUMNA: Formularz Rezerwacji                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  📋 Nowa Rezerwacja                                   │ │
│  │                                                       │ │
│  │  Data:     [  2026-05-10  ]                           │ │
│  │  Od:       [  10:00      ]                            │ │
│  │  Do:       [  11:00      ]                            │ │
│  │                                                       │ │
│  │           [✅ Zarezerwuj Termin]                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

STANY:
  [loading]  → spinner centralny
  [error]    → "Nie udało się załadować boiska"
  [niezalogowany] → "Zaloguj się, aby dokonać rezerwacji"
  [konflikt] → "Ten termin jest już zajęty (409)"
```

---

## 5. Panel Użytkownika (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│  👤 Moje Rezerwacje                                         │
│  Zarządzaj swoimi rezerwacjami boisk.                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Aktywne Rezerwacje                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🏟 Boisko Miejskie nr 1        Status: [ACTIVE] ✅   │ │
│  │  📅 10 maja 2026, 10:00 – 11:00                       │ │
│  │  Zarezerwowano: 30 kwietnia 2026          [✕ Anuluj]  │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ...kolejne rezerwacje...                             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Anulowane                                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🏟 Korty Tenisowe         Status: [CANCELLED] ❌     │ │
│  │  📅 5 maja 2026, 14:00 – 15:00                        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

STANY:
  [loading]  → skeleton lista
  [error]    → "Nie udało się załadować rezerwacji"
  [empty]    → "Nie masz jeszcze żadnych rezerwacji" + [Przeglądaj Boiska]
  [nieuprawniony] → redirect do /login
```

---

## 6. Panel Admina (`/admin`)

```
┌─────────────────────────────────────────────────────────────┐
│  🛡 Panel Administratora                                    │
│  [Boiska]  [Rezerwacje]  [Użytkownicy]   ← TABS            │
└─────────────────────────────────────────────────────────────┘

TAB: Boiska
┌─────────────────────────────────────────────────────────────┐
│  [+ Dodaj nowe boisko]                                      │
│                                                             │
│  ┌─ Formularz dodawania (conditional) ──────────────────┐  │
│  │  Nazwa: [________________]                           │  │
│  │  Opis:  [________________]                           │  │
│  │  Od:    [08:00]   Do: [22:00]                        │  │
│  │                   [Dodaj]  [Anuluj]                  │  │
│  └────────────────────────────────────────────────────── ┘  │
│                                                             │
│  Tabela boisk:                                              │
│  ID │ Nazwa         │ Godziny        │ Akcje               │
│  ───┼───────────────┼────────────────┼─────────────────    │
│   1 │ Boisko Miej.  │ 08:00 – 22:00  │ [✏ Edytuj][🗑 Usuń] │
│   2 │ Korty Tenisowe│ 09:00 – 21:00  │ [✏ Edytuj][🗑 Usuń] │
└─────────────────────────────────────────────────────────────┘

TAB: Rezerwacje
┌─────────────────────────────────────────────────────────────┐
│  Wszystkie Rezerwacje w Systemie                            │
│  ID │ Użytkownik │ Boisko  │ Termin          │ Status      │
│  ───┼────────────┼─────────┼─────────────────┼──────────── │
│   1 │ user@...   │ Boisko1 │ 10.05, 10-11    │ ACTIVE [✕] │
│   2 │ jan@...    │ Korty   │ 11.05, 14-15    │ CANCELLED  │
└─────────────────────────────────────────────────────────────┘

STANY:
  [nieuprawniony] → redirect do /login + komunikat "Brak dostępu"
  [loading]       → spinner / skeleton tabeli
  [error]         → "Błąd ładowania danych"
```

---

## 7. Strony Autoryzacji

### Login (`/login`)
```
┌─────────────────────────────────────────────────────────────┐
│                    [centered card]                          │
│                                                             │
│           ⚡ SportBook                                      │
│           Zaloguj się do konta                             │
│                                                             │
│  Email:   [________________________]                        │
│  Hasło:   [________________________] 👁                     │
│                                                             │
│                    [→ Zaloguj się]                          │
│                                                             │
│  Nie masz konta? [Zarejestruj się]                         │
└─────────────────────────────────────────────────────────────┘
```

### Register (`/register`)
```
┌─────────────────────────────────────────────────────────────┐
│           ⚡ SportBook                                      │
│           Utwórz nowe konto                                │
│                                                             │
│  Email:           [________________________]               │
│  Hasło:           [________________________] 👁             │
│  Potwierdź hasło: [________________________] 👁             │
│                                                             │
│                    [→ Zarejestruj się]                      │
│                                                             │
│  Masz już konto? [Zaloguj się]                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Komponenty Stanów (Reużywalne)

| Komponent | Użycie | Opis |
|-----------|--------|------|
| `<LoadingSpinner>` | Dowolna strona | Animowany pierścień emerald, centralnie |
| `<SkeletonCard>` | Listy | Szare bloki z animacją shimmer |
| `<ErrorState>` | Dowolna strona | Ikona ⚠, opis błędu, przycisk retry |
| `<EmptyState>` | Listy | Ikona tematyczna, komunikat, opcjonalny CTA |

---

## 9. Paleta Kolorów i Tokeny

| Token | Wartość | Zastosowanie |
|-------|---------|--------------|
| `--bg-base` | `#0a0f1e` | Tło strony |
| `--bg-card` | `#0f172a` | Karty, formularze |
| `--bg-card-hover` | `#1e293b` | Hover kart |
| `--accent-emerald` | `#10b981` | CTA, aktywne elementy |
| `--accent-cyan` | `#06b6d4` | Akcenty drugorzędne |
| `--text-primary` | `#f8fafc` | Nagłówki |
| `--text-secondary` | `#94a3b8` | Opisy, metadane |
| `--border` | `rgba(255,255,255,0.1)` | Obramowania kart |
| `--status-active` | `#10b981` | Status ACTIVE |
| `--status-cancelled` | `#ef4444` | Status CANCELLED |
