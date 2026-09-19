# GitHub Projekty

Aplikacja mobilna (Expo / React Native / TypeScript) do przeglądania **własnych repozytoriów GitHub** po zalogowaniu Personal Access Tokenem (PAT). Dane pochodzą wyłącznie z live GitHub REST API — nic nie jest wymyślane w UI.

## Funkcje

- Logowanie tokenem PAT (przechowywanie w `expo-secure-store`), wylogowanie
- Lista wszystkich repozytoriów użytkownika (paginacja API gdy >100)
- Nazwa, opis, język, gwiazdki, forki, prywatne/publiczne, `updated_at`
- Pull-to-refresh
- Wyszukiwanie po nazwie + filtry widoczności (wszystkie / publiczne / prywatne) i sortowanie (aktualizacja / gwiazdki / nazwa)
- Ekran szczegółów: opis, topics, domyślna gałąź, ostatni push, open issues, licencja, przycisk „Otwórz na GitHub”, podgląd README (surowy markdown jako tekst)
- Stany: ładowanie / pusto / błąd
- UI po polsku, dark-friendly, safe areas

## Wymagania

- Node.js 20+ (zalecane)
- Konto GitHub + PAT ze scope **`repo`**
- Expo Go (opcjonalnie) lub emulator

## Jak uruchomić

```bash
git clone https://github.com/XOOGKlastry/github-projekty-app.git
cd github-projekty-app
npm install
npx expo start
```

Następnie:

- naciśnij `a` (Android) / `i` (iOS na macOS), albo
- zeskanuj QR kodem w aplikacji **Expo Go**

## Jak utworzyć Personal Access Token (PAT)

1. Wejdź na GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Wybierz **Tokens (classic)** → **Generate new token**
3. Nadaj nazwę, ustaw wygaśnięcie
4. Zaznacz scope **`repo`** (pełny dostęp do prywatnych repozytoriów)
5. Wygeneruj token, skopiuj go i wklej w aplikacji

> Token jest przechowywany lokalnie na urządzeniu (`expo-secure-store`). Nie commituj tokenów do repozytorium.

## Stack

- Expo SDK (aktualny stabilny z szablonu)
- `expo-router` (nawigacja plikowa)
- TypeScript
- `expo-secure-store`
- GitHub REST API (`fetch`, `Authorization: Bearer TOKEN`)

## English (short)

Mobile Expo app that lists your GitHub repositories using a Personal Access Token stored in Secure Store. Search, filter (public/private), sort, and open repo details including a raw README preview. Run with `npm install` then `npx expo start`. Create a classic PAT with the `repo` scope.

## Licencja

Zobacz plik `LICENSE` w repozytorium.
