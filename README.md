# SportBook — System Rezerwacji Boisk i Obiektów Sportowych

## Opis projektu

Aplikacja webowa pozwalająca na przeglądanie dostępności i rezerwację lokalnych obiektów sportowych w wybranych przedziałach czasowych. Projekt ma na celu cyfryzację i automatyzację procesu wynajmu boisk z wdrożeniem bezpiecznego logowania oraz podziałem uprawnień (Użytkownik / Administrator).

Aplikacja charakteryzuje się nowoczesnym i responsywnym interfejsem użytkownika w stylu **dark-first design** z dbałością o estetykę (płynne przejścia, micro-animations, glassmorphism) oraz rozbudowanymi mechanizmami walidacji po stronie backendu i frontendu.

**Autor:** Wiktor Stachura

---

## Użyte technologie

* **Frontend:** Next.js 16 (React 19, Tailwind CSS v4)
* **Backend:** Next.js API Routes (Node.js)
* **Baza danych:** SQLite + Prisma ORM
* **Uwierzytelnianie & Autoryzacja:** JWT (JSON Web Tokens) + haszowanie haseł (bcryptjs)
* **Testowanie:** Vitest
* **Monitoring & Logi:** Sentry (opcjonalnie przez `SENTRY_DSN`) + lokalny fallback do plików logów (struktura JSON)

---

## Główne Funkcjonalności

1. **Przeglądanie obiektów:** Interaktywna lista obiektów sportowych z informacjami o godzinach otwarcia oraz szczegółowym opisem.
2. **Dostępność w czasie rzeczywistym:** Dynamiczny kalendarz prezentujący zajęte i wolne sloty czasowe (co godzinę) pobierane asynchronicznie bezpośrednio z API.
3. **System rezerwacji:** Możliwość rezerwowania wolnych slotów przez zalogowanych użytkowników z automatycznym wykrywaniem i blokowaniem nakładających się terminów.
4. **Panel Użytkownika (Dashboard):** Lista rezerwacji danego użytkownika z podziałem na statusy (aktywne, anulowane) oraz opcja samodzielnego anulowania rezerwacji (do 24 godzin przed planowanym rozpoczęciem).
5. **Panel Administratora (Admin Panel):**
   - **Zarządzanie obiektami (CRUD):** Dodawanie nowych boisk, edycja istniejących (nazwa, opis, godziny otwarcia) oraz ich usuwanie.
   - **Podgląd rezerwacji:** Pełna lista wszystkich rezerwacji w systemie z opcją natychmiastowego anulowania administratora (bez ograniczeń czasowych).
6. **Logowanie i rejestracja:** Bezpieczny proces rejestracji konta z walidacją siły hasła i unikalności adresu e-mail.
7. **Tracer i Monitoring:** Każde zapytanie API jest monitorowane pod kątem wydajności (czas odpowiedzi) i ewentualnych błędów, zapisując dane do plików `logs/monitoring.log` oraz `logs/perf.log`.

---

## Instrukcja Uruchomienia Produkcyjnego

### Wymagania wstępne
- Node.js w wersji **18.x** lub **20.x** (zalecana **v20.20.1**)
- npm (dołączony do Node.js)

### Krok po kroku

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/TAW-26/TAW_Wiktor_Stachura.git
   cd TAW_Wiktor_Stachura
   ```

2. **Wybierz odpowiednią wersję Node.js:**
   ```bash
   nvm use 20.20.1
   ```

3. **Zainstaluj zależności produkcyjne oraz deweloperskie:**
   ```bash
   npm install --legacy-peer-deps --strict-ssl=false
   ```

4. **Skonfiguruj zmienne środowiskowe:**
   Utwórz plik `.env` w katalogu głównym projektu (możesz skopiować `.env.example`):
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="zmien-mnie-na-bezpieczny-klucz-produkcyjny-12345"
   # SENTRY_DSN="opcjonalny_klucz_dsn_sentry"
   ```

5. **Wdróż schemat bazy danych i przygotuj środowisko:**
   ```bash
   # Uruchom migracje Prisma w bazie danych
   npx prisma migrate deploy
   
   # Opcjonalnie: Uruchom skrypt czyszczący, który usunie dane testowe i utworzy konto admina
   node scripts/cleanup-db.mjs
   ```
   *Po uruchomieniu skryptu cleanup w bazie danych zostanie utworzone domyślne konto administratora:*
   - **Email:** `admin@example.com`
   - **Hasło:** `Admin1234!`

6. **Zbuduj aplikację dla środowiska produkcyjnego:**
   ```bash
   npm run build
   ```

7. **Uruchom serwer produkcyjny:**
   ```bash
   # Start na domyślnym porcie 3000
   npm run start
   
   # Uruchomienie na innym porcie (np. 3001) w razie konfliktu
   npx next start -p 3001
   ```

8. **Otwórz aplikację w przeglądarce:**
   Przejdź pod adres: [http://localhost:3000](http://localhost:3000) (lub port 3001, jeśli został wybrany).

---

## Testowanie i Utrzymanie

- **Uruchomienie testów jednostkowych:**
  ```bash
  npm run test
  ```
- **Uruchomienie testów obciążeniowych:**
  System zawiera prosty skrypt do symulacji obciążenia:
  ```bash
  node scripts/load-test.mjs
  ```

---

## Znane Ograniczenia i Plany na Przyszłość

- **Baza danych SQLite:** Użycie SQLite jest idealne do celów demonstracyjnych i deweloperskich. W pełnym środowisku produkcyjnym z dużą współbieżnością zaleca się migrację na bazę PostgreSQL (wystarczy zmiana typu w `prisma/schema.prisma` i konfiguracji połączenia).
- **Strefy czasowe:** Aplikacja bazuje na strefie czasowej serwera (UTC we wpisach bazodanowych). Przy wdrożeniu globalnym wymagana jest konwersja stref po stronie klienta.
- **Brak integracji płatności:** Rezerwacje są darmowe i zatwierdzane natychmiastowo. W docelowym systemie wymagana byłaby bramka płatnicza (np. Stripe/PayU).
- **Powiadomienia:** Brak wysyłania e-maili z potwierdzeniami rezerwacji (wymaga podpięcia serwera SMTP lub serwisu typu SendGrid).

---

## Dokumentacja Projektowa

Wszystkie szczegółowe dokumenty projektowe i diagramy znajdują się w katalogu `docs/`:
- **Diagram bazy danych (ERD):** [erd.dbml](file:///c:/PROJECTS/taw-wiktor-stachura/docs/erd.dbml) oraz graficzny [erd.png](file:///c:/PROJECTS/taw-wiktor-stachura/docs/erd.png)
- **Makiety i struktura UI:** [ui.md](file:///c:/PROJECTS/taw-wiktor-stachura/docs/ui.md)
- **Specyfikacja API REST:** [api.md](file:///c:/PROJECTS/taw-wiktor-stachura/docs/api.md)
- **Monitoring i Logi:** [monitoring.md](file:///c:/PROJECTS/taw-wiktor-stachura/docs/monitoring.md)
- **Przypadki użycia (Use Cases):** [use_cases.md](file:///c:/PROJECTS/taw-wiktor-stachura/docs/use_cases.md)
