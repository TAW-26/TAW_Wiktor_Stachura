# Przypadki użycia (Use Cases)

## Aktorzy w systemie

1. **Użytkownik (Klient)** - osoba zarejestrowana w systemie, szukająca wolnego obiektu do wynajęcia.
2. **Administrator (Zarządca)** - osoba zarządzająca systemem, obiektami oraz nadzorująca rezerwacje.

---

## Scenariusze Użytkownika (Klienta)

### UC-1: Rejestracja i Logowanie

* **Opis:** Użytkownik może założyć nowe konto podając email i hasło, a następnie zalogować się do systemu.
* **Wymagania wstępne:** Brak.

### UC-2: Przeglądanie listy boisk

* **Opis:** Użytkownik widzi listę dostępnych obiektów sportowych wraz z ich opisem i godzinami otwarcia.

### UC-3: Sprawdzanie dostępności

* **Opis:** Po wybraniu konkretnego boiska użytkownik widzi kalendarz lub listę dostępnych / zajętych godzin w danym dniu.

### UC-4: Rezerwacja boiska

* **Opis:** Użytkownik wybiera wolny przedział czasowy i potwierdza rezerwację. System weryfikuje, czy termin nie koliduje z inną rezerwacją.
* **Wymagania wstępne:** Użytkownik musi być zalogowany.

### UC-5: Zarządzanie własnymi rezerwacjami

* **Opis:** Użytkownik może wyświetlić listę swoich nadchodzących rezerwacji i ma możliwość ich anulowania (np. na min. 24h przed terminem).

---

## Scenariusze Administratora

### UC-6: Logowanie z uprawnieniami

* **Opis:** Administrator loguje się do systemu (analogicznie do użytkownika, jednak system rozpoznaje rolę 'ADMIN').

### UC-7: Zarządzanie boiskami (CRUD)

* **Opis:** Administrator może dodawać nowe obiekty, edytować istniejące (zmieniać nazwy, opisy), usuwać obiekty oraz ustalać godziny ich otwarcia.

### UC-8: Przegląd wszystkich rezerwacji

* **Opis:** Administrator ma wgląd we wszystkie rezerwacje w systemie, niezależnie od tego, który użytkownik ich dokonał (np. w formie ogólnego kalendarza).

### UC-9: Zarządzanie rezerwacjami klientów

* **Opis:** Administrator może anulować dowolną rezerwację (np. w przypadku awarii obiektu) ze statusem np. `CANCELLED_BY_ADMIN`.
