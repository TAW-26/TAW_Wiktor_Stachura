---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0a0f1e
color: #f8fafc
style: |
  section {
    font-family: 'Inter', sans-serif;
    color: #f8fafc;
  }
  h1, h2, h3 {
    color: #10b981;
  }
  footer {
    color: #94a3b8;
  }
---

# SportBook
## System Rezerwacji Boisk i Obiektów Sportowych

**Prezentacja Projektu**
Autor: Wiktor Stachura

---

## Cel Projektu

* **Cyfryzacja procesu rezerwacji:** Ułatwienie lokalnej społeczności dostępu do obiektów sportowych (orliki, korty tenisowe, hale).
* **Automatyzacja wynajmu:** Eliminacja konieczności kontaktu telefonicznego/osobistego i ręcznego zapisywania rezerwacji.
* **Nowoczesne doświadczenie użytkownika (UX):** Zapewnienie intuicyjnego, estetycznego (dark-first layout) i responsywnego interfejsu działającego na każdym urządzeniu.

---

## Zakres Projektu

* **Uwierzytelnianie & Autoryzacja:** Rejestracja użytkowników, logowanie z wykorzystaniem tokenów JWT, podział ról (`USER` / `ADMIN`).
* **Przeglądanie dostępności:** Prezentacja obiektów oraz ich godzinowych planów zajętości w czasie rzeczywistym.
* **Proces rezerwacyjny:** Wybór wolnego przedziału czasowego, rezerwacja z natychmiastowym potwierdzeniem i walidacją konfliktów terminów.
* **Panel Użytkownika:** Przegląd historii swoich rezerwacji i możliwość anulowania terminu (do 24h przed startem).
* **Panel Administratora:** Pełne zarządzanie bazą obiektów (CRUD) oraz możliwość odwoływania dowolnych rezerwacji.

---

## Architektura Systemu

```
               +--------------------------------------+
               |        Frontend (React / Next.js)     |
               |       Tailwind CSS v4 (Dark-First)    |
               +------------------+-------------------+
                                  |
                                  | API Requests (JWT Auth)
                                  v
               +--------------------------------------+
               |    Next.js Route Handlers (Backend)  |
               +------------------+-------------------+
                                  |
                                  | Prisma ORM
                                  v
               +--------------------------------------+
               |         Baza Danych (SQLite)         |
               +--------------------------------------+
```

* **Frontend & Backend w jednym frameworku (Next.js):** Szybkie i spójne programowanie typu Fullstack.
* **Prisma ORM:** Zapewnia silnie typowany dostęp do danych i czytelną strukturę schematu.

---

## Model Danych (Baza Danych)

Aplikacja wykorzystuje 3 powiązane encje:

* **User (Użytkownik):** Dane profilowe, zaszyfrowane hasło (`passwordHash`) i rola (`USER`/`ADMIN`).
* **Facility (Obiekt sportowy):** Nazwa, opis oraz godziny otwarcia (`openTime`, `closeTime`).
* **Reservation (Rezerwacja):** Powiązanie użytkownika z obiektem, przedział czasowy (`startTime`, `endTime`) oraz status (`ACTIVE`, `CANCELLED_BY_USER`, `CANCELLED_BY_ADMIN`).

*Zaimplementowano indeksy bazodanowe na polach czasowych rezerwacji w celu optymalizacji zapytań o dostępność.*

---

## Monitoring i Logowanie

* **Trace poziomu zapytań (Request-level tracing):** Specjalny wrapper dla API logujący metodę, ścieżkę, status odpowiedzi oraz ewentualne błędy.
* **Śledzenie wydajności (Performance timing):** Monitorowanie czasu przetwarzania kluczowych operacji (np. tworzenie rezerwacji, logowanie).
* **Sentry Integration:** Integracja z Sentry do automatycznego agregowania błędów w chmurze.
* **Lokalny Fallback:** W przypadku braku konfiguracji Sentry, dane są strukturyzowane w formacie JSON i zapisywane lokalnie do plików `logs/monitoring.log` oraz `logs/perf.log`.

---

## Scenariusz Demonstracji Live

1. **Rejestracja i Logowanie:** Rejestracja nowego użytkownika i logowanie (prezentacja walidacji haseł).
2. **Przeglądanie i Rezerwacja:** Wejście na listę boisk, wybór "Orlika", przegląd dostępnych godzin i pomyślne zarezerwowanie slotu.
3. **Konflikt terminów:** Próba ponownej rezerwacji tego samego slotu (prezentacja komunikatu o zajętym terminie).
4. **Zarządzanie kontem:** Przejście do Panelu Użytkownika, podgląd rezerwacji i jej anulowanie.
5. **Panel Admina:** Logowanie jako administrator (`admin@example.com`), dodanie nowego obiektu (np. "Kryty Basen") i edycja jego godzin.

---

## Wyzwania i Rozwiązania

* **Wyzwanie 1: Kolejność importów CSS w Tailwind v4 i Next.js.**
  * *Problem:* Turbopack wyrzucał błędy kompilacji dotyczące kolejności `@import` w `globals.css`.
  * *Rozwiązanie:* Przebudowano strukturę stylów, umieszczając importy systemowe na początku pliku przed tokenami projektowymi.
* **Wyzwanie 2: Spójność bazy w testach i produkcji.**
  * *Problem:* Zanieczyszczenie bazy danymi testowymi przed wdrożeniem produkcyjnym.
  * *Rozwiązanie:* Stworzono dedykowany skrypt `cleanup-db.mjs` automatyzujący czyszczenie testowych rezerwacji i użytkowników oraz tworzący czyste konto admina i zestawy obiektów.
* **Wyzwanie 3: Wąskie gardła sieciowe przy pobieraniu czcionek.**
  * *Problem:* Next.js Google Fonts parser blokował kompilację produkcyjną w środowisku offline.
  * *Rozwiązanie:* Zastąpiono pobieranie w czasie budowania standardowym CSS `@import` ładowanym w przeglądarce klienta oraz bezpiecznym zestawem fontów systemowych.

---

## Podsumowanie

* **Gotowość wdrożeniowa:** Projekt przeszedł pełne testy integracyjne, poprawnie się buduje i działa stabilnie w trybie produkcyjnym.
* **Wysoki standard UX/UI:** Wykorzystanie Tailwind v4 oraz autorskich klas CSS pozwoliło osiągnąć nowoczesny interfejs z płynnymi animacjami (skeletons, hover effects).
* **Architektura zorientowana na rozwój:** Dzięki Prisma ORM i Next.js API, migracja na bazę PostgreSQL lub dołożenie płatności online wymaga minimalnego nakładu pracy.

**Dziękuję za uwagę! Pytania?**
