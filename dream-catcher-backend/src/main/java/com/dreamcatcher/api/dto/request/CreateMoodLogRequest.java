package com.dreamcatcher.api.dto.request;

// DTO = Data Transfer Object — obiekt do przesyłania danych
// między warstwami aplikacji (np. z kontrolera do serwisu).
// Nie jest encją JPA, nie trafia bezpośrednio do bazy.

import com.dreamcatcher.domain.core.MoodLog;
import jakarta.validation.constraints.*;   // adnotacje walidacji Bean Validation

import java.time.LocalDate;

// ═══════════════════════════════════════════════════════════════
// RECORD — nowa składnia Javy 16+ dla niemutowalnych klas danych.
//
// Zamiast pisać:
//   public class CreateMoodLogRequest {
//       private final LocalDate date;
//       public CreateMoodLogRequest(LocalDate date) { this.date = date; }
//       public LocalDate date() { return date; }
//       // equals(), hashCode(), toString() — też ręcznie...
//   }
//
// Record robi to AUTOMATYCZNIE:
//   - tworzy prywatne finalne pola
//   - tworzy konstruktor ze wszystkimi parametrami
//   - tworzy akcesory (date(), latitude()...) — bez "get" w nazwie!
//   - generuje equals(), hashCode(), toString()
//
// Parametry w nawiasie () to jednocześnie:
//   - pola rekordu
//   - parametry konstruktora
//   - akcesory (metody dostępu)
// ═══════════════════════════════════════════════════════════════
public record CreateMoodLogRequest(

        // ─────────────────────────────────────────────────────
        // ADNOTACJE WALIDACJI — sprawdzane przez @Valid w kontrolerze.
        // Jeśli warunek nie jest spełniony, Spring zwraca 400 Bad Request
        // z opisem błędu, ZANIM wywołana zostanie metoda serwisu.
        //
        // @NotNull — pole nie może być null
        // @DecimalMin / @DecimalMax — zakres dla liczb dziesiętnych
        // @Min / @Max — zakres dla liczb całkowitych
        // @Size(max=N) — maksymalna długość tekstu
        // ─────────────────────────────────────────────────────

        @NotNull
        LocalDate date,         // np. "2024-03-28" (JSON) → LocalDate (Java)

        @NotNull
        @DecimalMin("-90.0") @DecimalMax("90.0")
        Double latitude,        // szerokość geograficzna (Double z dużej = może być null)

        @NotNull
        @DecimalMin("-180.0") @DecimalMax("180.0")
        Double longitude,       // długość geograficzna

        @NotNull
        MoodLog.MoodType morningMood,   // enum — JSON "HAPPY" → MoodType.HAPPY

        @NotNull
        MoodLog.MoodType eveningMood,

        @Min(1) @Max(10)
        int energyLevel,        // int z małej = prymityw, nie może być null

        @Min(1) @Max(10)
        int stressLevel,

        @Size(max = 1000)
        String notes            // może być null (brak @NotNull)

// Puste ciało {} — record nie potrzebuje nic więcej.
// Wszystko generuje kompilator.
) {}

// JAK WYGLĄDA JSON WYSŁANY Z FRONTENDU:
// {
//   "date": "2024-03-28",
//   "latitude": 52.23,
//   "longitude": 21.01,
//   "morningMood": "NEUTRAL",
//   "eveningMood": "HAPPY",
//   "energyLevel": 7,
//   "stressLevel": 3,
//   "notes": "Dobry dzień"
// }
//
// Spring automatycznie deserializuje JSON → obiekt CreateMoodLogRequest
// (Jackson ObjectMapper). Potem @Valid uruchamia walidację adnotacji.
