package com.dreamcatcher.domain.core;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

// ═══════════════════════════════════════════════════════════════
// @Entity — ta klasa to tabela w bazie danych.
//   Każdy obiekt MoodLog = jeden wiersz w tabeli "mood_logs".
//
// @Table(name = "mood_logs") — jawna nazwa tabeli.
//   Bez tej adnotacji Hibernate użyłby nazwy klasy ("MoodLog").
// ═══════════════════════════════════════════════════════════════
@Entity
@Table(name = "mood_logs")

// ═══════════════════════════════════════════════════════════════
// DZIEDZICZENIE (extends) — MoodLog "dziedziczy" po LogEntry.
// Oznacza:
//   1. MoodLog ma wszystkie pola z LogEntry (id, userId, date...)
//   2. MoodLog ma wszystkie metody z LogEntry (getId(), getDate()...)
//   3. MoodLog MUSI zaimplementować metodę abstract calculateWellnessScore()
//
// FINAL — klasa nie może być dalej dziedziczona.
//   Zapobiega przypadkowemu rozszerzaniu przez inne klasy.
// ═══════════════════════════════════════════════════════════════
public final class MoodLog extends LogEntry {

    // ─────────────────────────────────────────────────────────
    // ENUM (enumeration) — zestaw predefiniowanych stałych.
    // Zamiast przechowywać "HAPPY" jako String (podatny na literówki),
    // używamy enum — kompilator sprawdzi poprawność wartości.
    //
    // Enum definiujemy WEWNĄTRZ klasy gdy jest z nią ściśle powiązany.
    // Dostęp z zewnątrz: MoodLog.MoodType.HAPPY
    //
    // Każda stała enum ma swój numer porządkowy (ordinal):
    //   EUPHORIC=0, HAPPY=1, NEUTRAL=2, ANXIOUS=3, SAD=4, IRRITABLE=5, EXHAUSTED=6
    // ─────────────────────────────────────────────────────────
    public enum MoodType {
        EUPHORIC,    // euforyczny
        HAPPY,       // szczęśliwy
        NEUTRAL,     // neutralny
        ANXIOUS,     // niespokojny
        SAD,         // smutny
        IRRITABLE,   // drażliwy
        EXHAUSTED    // wyczerpany
        // Kolejność ma znaczenie! isMoodImproved() porównuje ordinal().
        // Niższy index = lepszy nastrój (EUPHORIC < HAPPY < NEUTRAL...)
    }

    // ─────────────────────────────────────────────────────────
    // POLA WŁASNE KLASY (dodatkowe, poza tymi z LogEntry)
    //
    // @Enumerated(EnumType.STRING) — w bazie przechowuje tekst "HAPPY",
    // nie liczbę 1. Dzięki temu baza jest czytelna i odporna
    // na zmianę kolejności wartości enum.
    // ─────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodType morningMood;   // nastrój poranny

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodType eveningMood;   // nastrój wieczorny

    @Column(nullable = false)
    private int energyLevel;        // poziom energii 1-10 (int = prymityw, nie obiekt)

    @Column(nullable = false)
    private int stressLevel;        // poziom stresu 1-10

    @Column(length = 1000)          // VARCHAR(1000) w bazie
    private String notes;           // notatki (mogą być null — nie ma @Column(nullable=false))

    // ─────────────────────────────────────────────────────────
    // KONSTRUKTOR BEZARGUMENTOWY — wymagany przez JPA/Hibernate.
    // "protected" — nie można go wywołać z zewnętrznego kodu,
    // ale Hibernate (używający refleksji) może go użyć.
    // ─────────────────────────────────────────────────────────
    protected MoodLog() {}

    // ─────────────────────────────────────────────────────────
    // KONSTRUKTOR WŁAŚCIWY
    // Wywołanie: new MoodLog(userId, date, ctx, HAPPY, NEUTRAL, 7, 3, "dobry dzień")
    //
    // "super(userId, date, context)" — wywołuje konstruktor klasy nadrzędnej
    // (LogEntry). Musi być PIERWSZĄ linią konstruktora podklasy.
    //
    // PARAMETRY:
    //   UUID userId          — identyfikator użytkownika
    //   LocalDate date       — data wpisu
    //   EnvironmentalContext — dane pogody i księżyca
    //   MoodType morningMood — enum (jedna z 7 wartości)
    //   MoodType eveningMood — enum
    //   int energyLevel      — prymityw (nie Integer — brak wartości null)
    //   int stressLevel      — prymityw
    //   String notes         — może być null (opcjonalne)
    // ─────────────────────────────────────────────────────────
    public MoodLog(UUID userId, LocalDate date, EnvironmentalContext context,
                   MoodType morningMood, MoodType eveningMood,
                   int energyLevel, int stressLevel, String notes) {

        // Wywołanie konstruktora klasy nadrzędnej LogEntry
        super(userId, date, context);

        // Walidacja zakresu — rzuca wyjątek jeśli poza 1-10
        // IllegalArgumentException = błąd wywołującego (złe dane)
        if (energyLevel < 1 || energyLevel > 10)
            throw new IllegalArgumentException("energyLevel must be 1–10");
        if (stressLevel < 1 || stressLevel > 10)
            throw new IllegalArgumentException("stressLevel must be 1–10");

        // Objects.requireNonNull chroni przed NullPointerException
        this.morningMood = Objects.requireNonNull(morningMood, "morningMood cannot be null");
        this.eveningMood = Objects.requireNonNull(eveningMood, "eveningMood cannot be null");

        // Proste przypisanie dla prymitywów (int nie może być null)
        this.energyLevel = energyLevel;
        this.stressLevel = stressLevel;

        // notes może być null — to pole opcjonalne
        this.notes = notes;
    }

    // ─────────────────────────────────────────────────────────
    // NADPISANIE METODY ABSTRAKCYJNEJ — @Override
    // @Override to adnotacja informacyjna — mówi kompilatorowi
    // "ta metoda nadpisuje metodę z klasy nadrzędnej".
    // Jeśli zrobisz literówkę w nazwie, kompilator zgłosi błąd.
    //
    // LOGIKA BIZNESOWA:
    //   1. Bazowa ocena nastroju wieczornego (0–100)
    //   2. Kara za niskie ciśnienie (-10) i pełnię (-5)
    //   3. Premia za energię, kara za stres
    //   4. Math.max/min — obcięcie do zakresu 0–100
    //
    // WYRAŻENIE switch — Java 14+, bardziej zwięzłe niż stary switch.
    //   Każdy "case X ->" zwraca wartość. Brak "break" — nie ma fall-through.
    // ─────────────────────────────────────────────────────────
    @Override
    public int calculateWellnessScore() {
        // switch expression (nie statement) — zwraca wartość
        int moodScore = switch (eveningMood) {
            case EUPHORIC  -> 100;  // "->" zamiast ":" + "break"
            case HAPPY     -> 80;
            case NEUTRAL   -> 60;
            case ANXIOUS   -> 40;
            case SAD       -> 30;
            case IRRITABLE -> 25;
            case EXHAUSTED -> 20;
        };

        // Metody chronione z klasy nadrzędnej LogEntry
        if (isLowPressure()) moodScore -= 10;  // "-=" to skrót dla moodScore = moodScore - 10
        if (isFullMoon())    moodScore -= 5;

        // Działania na zmiennych lokalnych — żyją tylko w tej metodzie
        int finalScore = (moodScore + energyLevel * 5 - stressLevel * 5) / 2;

        // Math.max(a, b) — większa z dwóch wartości
        // Math.min(a, b) — mniejsza z dwóch wartości
        // Zagnieżdżone: zapewnia wynik w przedziale 0–100
        return Math.max(0, Math.min(100, finalScore));
    }

    // ─────────────────────────────────────────────────────────
    // METODA BIZNESOWA — zwraca boolean
    // "Poprawa nastroju" = wieczorny nastrój ma MNIEJSZY indeks
    // niż poranny (bo EUPHORIC=0 jest "lepszy" niż SAD=4).
    //
    // ordinal() — metoda każdego enum, zwraca numer porządkowy (int)
    //   EUPHORIC.ordinal() == 0
    //   HAPPY.ordinal()    == 1
    //   NEUTRAL.ordinal()  == 2
    // ─────────────────────────────────────────────────────────
    public boolean isMoodImproved() {
        return eveningMood.ordinal() < morningMood.ordinal();
    }

    // ─────────────────────────────────────────────────────────
    // GETTERY — metody publiczne do odczytu prywatnych pól.
    // Wzorzec nazewnictwa:
    //   - pola boolean → isXxx() lub hasXxx()
    //   - pozostałe    → getXxx()
    //
    // Brak setterów! Wpisy w dzienniku są niezmienne po zapisaniu.
    // ─────────────────────────────────────────────────────────
    public MoodType getMorningMood()  { return morningMood; }
    public MoodType getEveningMood()  { return eveningMood; }
    public int getEnergyLevel()       { return energyLevel; }
    public int getStressLevel()       { return stressLevel; }
    public String getNotes()          { return notes; }   // może zwrócić null
}
