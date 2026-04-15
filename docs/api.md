# Dokumentacja API i Przykłady Testów

Base URL (lokalnie): `http://localhost:3000/api`

## Autoryzacja

### Rejestracja
- Metoda: `POST`
- Endpoint: `/auth/register`
- Body:
```json
{
  "email": "user@example.com",
  "password": "User12345!"
}
```
- Sukces: `201 Created`

### Logowanie
- Metoda: `POST`
- Endpoint: `/auth/login`
- Body:
```json
{
  "email": "user@example.com",
  "password": "User12345!"
}
```
- Sukces: `200 OK`
- Odpowiedź zawiera `token` (JWT)

## Obiekty

### Lista obiektów (publiczne)
- Metoda: `GET`
- Endpoint: `/facilities`
- Sukces: `200 OK`

### Utworzenie obiektu (ADMIN)
- Metoda: `POST`
- Endpoint: `/facilities`
- Nagłówki: `Authorization: Bearer <admin_token>`
- Body:
```json
{
  "name": "Boisko Testowe",
  "description": "Do testow API",
  "openTime": "08:00",
  "closeTime": "22:00"
}
```
- Sukces: `201 Created`
- Błędy: `401 Unauthorized`, `403 Forbidden`, `400 Bad Request`

### Pobranie pojedynczego obiektu (publiczne)
- Metoda: `GET`
- Endpoint: `/facilities/:id`
- Sukces: `200 OK`
- Błąd: `404 Not Found`

### Aktualizacja obiektu (ADMIN)
- Metoda: `PUT`
- Endpoint: `/facilities/:id`
- Nagłówki: `Authorization: Bearer <admin_token>`
- Sukces: `200 OK`

### Usunięcie obiektu (ADMIN)
- Metoda: `DELETE`
- Endpoint: `/facilities/:id`
- Nagłówki: `Authorization: Bearer <admin_token>`
- Sukces: `204 No Content`

### Dostępność dzienna (publiczne)
- Metoda: `GET`
- Endpoint: `/facilities/:id/availability?date=2026-05-10`
- Sukces: `200 OK`

## Rezerwacje

### Lista rezerwacji (chronione)
- Metoda: `GET`
- Endpoint: `/reservations`
- Nagłówki: `Authorization: Bearer <token>`
- Zachowanie:
  - USER widzi tylko swoje rezerwacje
  - ADMIN widzi wszystkie rezerwacje
- Sukces: `200 OK`

### Utworzenie rezerwacji (chronione)
- Metoda: `POST`
- Endpoint: `/reservations`
- Nagłówki: `Authorization: Bearer <user_token>`
- Body:
```json
{
  "facilityId": 1,
  "startTime": "2026-05-10T10:00:00.000Z",
  "endTime": "2026-05-10T11:00:00.000Z"
}
```
- Sukces: `201 Created`
- Błędy: `400 Bad Request`, `404 Not Found`, `409 Conflict`

### Pobranie pojedynczej rezerwacji (chronione)
- Metoda: `GET`
- Endpoint: `/reservations/:id`
- Nagłówki: `Authorization: Bearer <token>`
- Sukces: `200 OK`
- Błędy: `403 Forbidden`, `404 Not Found`

### Aktualizacja czasu rezerwacji (chronione)
- Metoda: `PUT`
- Endpoint: `/reservations/:id`
- Nagłówki: `Authorization: Bearer <token>`
- Body:
```json
{
  "startTime": "2026-05-10T12:00:00.000Z",
  "endTime": "2026-05-10T13:00:00.000Z"
}
```
- Sukces: `200 OK`

### Anulowanie rezerwacji (chronione)
- Metoda: `DELETE`
- Endpoint: `/reservations/:id`
- Nagłówki: `Authorization: Bearer <token>`
- Sukces: `200 OK` (status zmienia się na `CANCELLED_BY_USER` lub `CANCELLED_BY_ADMIN`)

### Twarde usunięcie rezerwacji (ADMIN)
- Metoda: `DELETE`
- Endpoint: `/reservations/:id?mode=hard`
- Nagłówki: `Authorization: Bearer <admin_token>`
- Sukces: `204 No Content`

## Użytkownicy

### Lista użytkowników (ADMIN)
- Metoda: `GET`
- Endpoint: `/users`
- Nagłówki: `Authorization: Bearer <admin_token>`
- Sukces: `200 OK`

### Utworzenie użytkownika (ADMIN)
- Metoda: `POST`
- Endpoint: `/users`
- Nagłówki: `Authorization: Bearer <admin_token>`
- Body:
```json
{
  "email": "manager@example.com",
  "passwordHash": "$2b$12$...",
  "role": "ADMIN"
}
```
- Sukces: `201 Created`

### Pobranie użytkownika po id (własne konto lub ADMIN)
- Metoda: `GET`
- Endpoint: `/users/:id`
- Nagłówki: `Authorization: Bearer <token>`
- Sukces: `200 OK`

### Aktualizacja użytkownika (własne konto lub ADMIN)
- Metoda: `PUT`
- Endpoint: `/users/:id`
- Nagłówki: `Authorization: Bearer <token>`
- Sukces: `200 OK`

### Usunięcie użytkownika (ADMIN)
- Metoda: `DELETE`
- Endpoint: `/users/:id`
- Nagłówki: `Authorization: Bearer <admin_token>`
- Sukces: `204 No Content`

## Wykonany Smoke Test (2026-04-15)

Wykonane lokalne testy end-to-end przez PowerShell:
1. Rejestracja USER przez `/auth/register`
2. Logowanie USER przez `/auth/login`
3. Logowanie ADMIN przez `/auth/login`
4. Utworzenie obiektu jako ADMIN przez `/facilities`
5. Utworzenie rezerwacji jako USER przez `/reservations`
6. Pobranie rezerwacji jako USER i jako ADMIN przez `/reservations`
7. Anulowanie rezerwacji jako USER przez `DELETE /reservations/:id`

Podsumowanie wyników:
- `registeredUserId`: utworzony poprawnie
- `createdFacilityId`: utworzony poprawnie
- `createdReservationId`: utworzony poprawnie
- `cancelStatus`: `CANCELLED_BY_USER`

## Szybka konfiguracja do testów

Jeżeli nie ma jeszcze konta administratora, uruchom:

```bash
node scripts/seed-admin.mjs
```

Domyślne dane administratora z tego skryptu:
- email: `admin@example.com`
- hasło: `Admin1234!`
