# Dream Catcher

Holistyczna aplikacja do śledzenia snów, nastroju i samopoczucia. Pozwala zapisywać sny, monitorować fazy księżyca, pogodę oraz analizować wzorce nastroju w czasie.

## Stos technologiczny

### Frontend
- **React 19** + Vite (JavaScript/JSX)
- **Tailwind CSS 4**
- **Zustand** — zarządzanie stanem
- **React Router DOM 7**
- **Recharts** — wykresy i analizy
- **Axios** — komunikacja z API

### Backend
- **Java 21** + **Spring Boot 3.2**
- **Spring Security** + JWT — uwierzytelnianie
- **Spring Data JPA** + **PostgreSQL**
- **WebFlux / WebClient** — integracje zewnętrzne

## Struktura projektu

```
react+java/
├── dream-catcher-frontend-js/   # Aplikacja React
└── dream-catcher-backend/       # API Spring Boot
```

## Uruchomienie

### Backend

```bash
cd dream-catcher-backend
./mvnw spring-boot:run
```

Wymaga uruchomionej bazy PostgreSQL. Domyślnie nasłuchuje na `http://localhost:8080`.

### Frontend

```bash
cd dream-catcher-frontend-js
npm install
npm run dev
```

Domyślnie dostępny pod `http://localhost:5173`.

## Funkcje

- Rejestracja i logowanie użytkowników (JWT)
- Zapisywanie wpisów w dzienniku snów
- Śledzenie nastroju i samopoczucia
- Wyświetlanie fazy księżyca i warunków pogodowych
- Wykresy i analiza nastrojów w czasie
- Responsywny interfejs (Tailwind CSS)
