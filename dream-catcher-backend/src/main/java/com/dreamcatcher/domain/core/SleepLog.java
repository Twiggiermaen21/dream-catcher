package com.dreamcatcher.domain.core;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import jakarta.persistence.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

// ─────────────────────────────────────────────────────────────
// @Entity — ta klasa to tabela w bazie danych.
// @Table(name = "sleep_logs") — jawna nazwa tabeli.
//
// final class — nie można tworzyć podklas SleepLog.
//   "Zamknięta" hierarchia — SleepLog jest konkretną implementacją,
//   nie projektujemy jej do dalszego dziedziczenia.
//
// extends LogEntry — dziedziczy pola i metody z klasy nadrzędnej:
//   id, userId, date, environmentalContext + ich gettery
//   metody pomocnicze: isFullMoon(), isLowPressure()
//   obowiązek implementacji: calculateWellnessScore()
// ─────────────────────────────────────────────────────────────
@Entity
@Table(name = "sleep_logs")
public final class SleepLog extends LogEntry {

    // ─────────────────────────────────────────────────────────
    // LocalTime — typ z Java Time API (Java 8+).
    // Reprezentuje czas BEZ daty i strefy czasowej (np. 22:30:00).
    // Inne typy z java.time:
    //   LocalDate     — tylko data (2024-03-28)
    //   LocalTime     — tylko czas (22:30:00)
    //   LocalDateTime — data + czas (2024-03-28T22:30:00)
    //   ZonedDateTime — data + czas + strefa (2024-03-28T22:30:00+01:00)
    // ─────────────────────────────────────────────────────────
    @Column(nullable = false)
    private LocalTime bedtime;      // pora pójścia spać, np. 22:30

    @Column(nullable = false)
    private LocalTime wakeTime;     // pora wstania, np. 06:45

    @Column(nullable = false)
    private int sleepQualityRating;   // 1–10, ocena własna użytkownika

    // boolean (z małej) = prymityw. Domyślna wartość: false.
    // Boolean (z dużej) = obiekt, może być null — tu nie chcemy null.
    private boolean hadNightmares;

    // ─────────────────────────────────────────────────────────
    // @ElementCollection — kolekcja wartości prostych (String, int...)
    // jako osobna tabela. Inaczej niż @OneToMany (relacja z encją).
    //
    // fetch = FetchType.EAGER — ładuj rytuały razem ze SleepLog.
    //   EAGER = natychmiast, w tym samym zapytaniu SQL.
    //   LAZY  = leniwie, dopiero gdy wywołasz getEveningRituals().
    //   (Dla kolekcji ElementCollection domyślny jest LAZY.)
    //
    // @CollectionTable — nazwa tabeli pomocniczej:
    //   "sleep_log_rituals" z kluczem obcym "sleep_log_id"
    //
    // @Column(name = "ritual") — nazwa kolumny z wartością w tabeli.
    //
    // SQL:
    //   CREATE TABLE sleep_log_rituals (
    //     sleep_log_id UUID REFERENCES sleep_logs(id),
    //     ritual VARCHAR(255)
    //   );
    // ─────────────────────────────────────────────────────────
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sleep_log_rituals", joinColumns = @JoinColumn(name = "sleep_log_id"))
    @Column(name = "ritual")
    private List<String> eveningRituals;  // np. "herbata", "medytacja", "brak ekranów"

    // Konstruktor bezargumentowy — wymagany przez JPA/Hibernate.
    // protected — widoczny tylko dla podklas i pakietu (nie z zewnątrz).
    protected SleepLog() {}

    // ─────────────────────────────────────────────────────────
    // Konstruktor właściwy — tworzenie obiektu z pełnymi danymi.
    //
    // super(userId, date, context) — wywołanie konstruktora LogEntry.
    //   MUSI być pierwszą linią w konstruktorze podklasy.
    //   Inicjalizuje wspólne pola: userId, date, environmentalContext.
    //
    // String.valueOf(sleepQualityRating) w IllegalArgumentException:
    //   Łączenie tekstu: "got: " + sleepQualityRating
    //   Java automatycznie konwertuje int → String przy użyciu "+".
    // ─────────────────────────────────────────────────────────
    public SleepLog(UUID userId, LocalDate date, EnvironmentalContext context,
                    LocalTime bedtime, LocalTime wakeTime,
                    int sleepQualityRating, boolean hadNightmares,
                    List<String> eveningRituals) {
        super(userId, date, context);

        // Walidacja zakresów — "szybka śmierć" (fail fast).
        // Rzuca wyjątek od razu zamiast zapisywać niepoprawne dane.
        if (sleepQualityRating < 1 || sleepQualityRating > 10) {
            throw new IllegalArgumentException("sleepQualityRating must be 1–10, got: " + sleepQualityRating);
        }

        // Objects.requireNonNull — chroni przed NullPointerException.
        // Rzuca NPE z czytelnym komunikatem zamiast gdzieś indziej.
        this.bedtime = Objects.requireNonNull(bedtime, "bedtime cannot be null");
        this.wakeTime = Objects.requireNonNull(wakeTime, "wakeTime cannot be null");
        this.sleepQualityRating = sleepQualityRating;
        this.hadNightmares = hadNightmares;

        // Obrona przed null i tworzenie niemutowalnej kopii listy.
        // List.of() — pusta niemutowalna lista (Java 9+).
        // List.copyOf() — niemutowalna kopia (Java 10+).
        // Niemutowalna = po stworzeniu nie można dodawać/usuwać elementów.
        this.eveningRituals = eveningRituals != null ? List.copyOf(eveningRituals) : List.of();
    }

    // ─────────────────────────────────────────────────────────
    // @Override — nadpisanie metody abstrakcyjnej z LogEntry.
    //
    // ALGORYTM obliczania wellness score dla snu:
    //   1. Baza: ocena własna × 8 (max 80/100)
    //   2. Kary środowiskowe: pełnia (-10), niskie ciśnienie (-8)
    //   3. Kara za koszmary (-15) — duży wpływ na jakość
    //   4. Bonus/kara za długość snu (7-9h = optymalnie)
    //   5. Bonus za rytuały (max 12 pkt)
    //   6. Obcięcie do 0-100
    //
    // Operatory skrótowe:
    //   score -= 10  →  score = score - 10
    //   score += 10  →  score = score + 10
    // ─────────────────────────────────────────────────────────
    @Override
    public int calculateWellnessScore() {
        int score = sleepQualityRating * 8;       // max 80 pkt z oceny własnej

        // Czynniki środowiskowe (metody z klasy nadrzędnej LogEntry)
        if (isFullMoon())    score -= 10;          // pełnia księżyca = gorszy sen
        if (isLowPressure()) score -= 8;           // niskie ciśnienie = niewyspanie
        if (hadNightmares)   score -= 15;          // koszmary mocno obniżają wynik

        // Czas snu – bonus za odpowiednią długość (7–9h)
        long minutes = getSleepDurationMinutes();
        if (minutes >= 420 && minutes <= 540) score += 10;  // 7–9 godzin (420-540 minut)
        else if (minutes < 360)              score -= 10;   // poniżej 6h (360 minut)

        // Bonus za rytuały wieczorne (każdy daje 3 pkt, max 12).
        // Math.min — zapobiega przekroczeniu limitu premii.
        // eveningRituals.size() — liczba elementów w liście.
        score += Math.min(eveningRituals.size() * 3, 12);

        return Math.max(0, Math.min(100, score));
    }

    // ─────────────────────────────────────────────────────────
    // Oblicza czas trwania snu w minutach.
    //
    // Duration — typ z java.time reprezentujący przedział czasu.
    // Duration.between(start, end) — różnica między dwoma czasami.
    //
    // PROBLEM: sen po północy!
    //   bedtime = 23:00, wakeTime = 07:00
    //   Duration.between(23:00, 07:00) = -16h (ujemna!)
    //   Poprawka: dodaj 24h
    //   -16h + 24h = 8h ✓
    //
    // d.isNegative() — sprawdza czy Duration jest ujemny.
    // d.plusHours(24) — dodaje 24 godziny.
    // d.toMinutes()   — konwertuje na minuty (long, nie int).
    //
    // Operator trójargumentowy (ternary):
    //   warunek ? wartość_jeśli_true : wartość_jeśli_false
    // ─────────────────────────────────────────────────────────
    public long getSleepDurationMinutes() {
        Duration d = Duration.between(bedtime, wakeTime);
        // Obsługa snu po północy (wakeTime < bedtime)
        return d.isNegative() ? d.plusHours(24).toMinutes() : d.toMinutes();
    }

    // ─────────────────────────────────────────────────────────
    // GETTERY — jedyna droga dostępu do prywatnych pól.
    //
    // Konwencja nazewnictwa:
    //   boolean → isXxx() lub hasXxx()  — "czy miał koszmary?"
    //   inne    → getXxx()              — "pobierz wartość"
    //
    // Brak setterów — wpisy w dzienniku są NIEZMIENNE po zapisaniu.
    // ─────────────────────────────────────────────────────────
    public LocalTime getBedtime()           { return bedtime; }
    public LocalTime getWakeTime()          { return wakeTime; }
    public int getSleepQualityRating()      { return sleepQualityRating; }
    public boolean isHadNightmares()        { return hadNightmares; }
    public List<String> getEveningRituals() { return eveningRituals; }
}
