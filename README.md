
# System rezerwacji boisk i obiektów sportowych

## Opis projektu

Aplikacja webowa pozwalająca na przeglądanie dostępności i rezerwację lokalnych obiektów sportowych w wybranych przedziałach czasowych. Projekt ma na celu cyfryzację i automatyzację procesu wynajmu boisk z wdrożeniem bezpiecznego logowania oraz podziałem uprawnień (Użytkownik / Administrator).

**Autor:** Wiktor Stachura

## Użyte technologie

* **Frontend:** Next.js (React.js, Tailwind CSS)
* **Backend:** Next.js API Routes / Server Actions (Node.js)
* **Baza danych:** SQLite + Prisma ORM
* **Autoryzacja:** NextAuth.js / JWT

## Instrukcja uruchomienia lokalnie

1. **Sklonuj repozytorium:**

   ```bash
   git clone <adres-repozytorium>
   cd <nazwa-folderu>
   ```
2. **Zainstaluj zależności:**

```bash
npm install
```

3. **Skonfiguruj bazę danych (Prisma):**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Uruchom serwer deweloperski:**

```
npm run dev
```

5. **Otwórz aplikację:**
   Przejdź w przeglądarce pod adres:[http://localhost:3000](https://www.google.com/url?sa=E&q=http%3A%2F%2Flocalhost%3A3000)

## 📚 Dokumentacja

**Diagram bazy danych: *wkrótce*.**

**Przypadki użycia: *wkrótce*.**
