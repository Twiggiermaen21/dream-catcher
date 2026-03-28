package com.dreamcatcher.domain.core;

// ═══════════════════════════════════════════════════════════════
// PAKIET (package) — określa "adres" klasy w projekcie.
// Klasy z tego samego pakietu widzą się nawzajem bez importów.
// Konwencja: odwrócona domena firmy + struktura folderów.
// ═══════════════════════════════════════════════════════════════

// IMPORT — ładuje klasy z innych pakietów do tego pliku.
// Bez importu Java nie wie co to "UUID", "LocalDate" itp.
import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.context.MoonData;
import jakarta.persistence.*;       // adnotacje JPA (baza danych)

import java.time.LocalDate;         // data bez czasu (2024-03-28)
import java.util.Objects;           // narzędzia pomocnicze
import java.util.UUID;              // unikalny identyfikator (np. 550e8400-e29b-...)

// ═══════════════════════════════════════════════════════════════
// ADNOTACJA JPA — @MappedSuperclass
// Oznacza że ta klasa NIE ma własnej tabeli w bazie,
// ale jej pola (id, userId, date...) zostaną "odziedziczone"
// przez tabele podklas (sleep_logs, mood_logs, dream_logs).
// ═══════════════════════════════════════════════════════════════
@MappedSuperclass

// ═══════════════════════════════════════════════════════════════
// KLASA ABSTRAKCYJNA (abstract class)
// - Nie można tworzyć obiektów tej klasy bezpośrednio:
//     new LogEntry()  ← BŁĄD KOMPILACJI
// - Służy jako "szablon" — zawiera wspólne pola i metody
//   dla SleepLog, MoodLog, DreamLog.
// - Wymusza na podklasach zaimplementowanie metod abstract.
//
// MODYFIKATORY DOSTĘPU:
//   public  — dostępne dla wszystkich klas
//   protected — dostępne tylko dla klas w tym samym pakiecie
//               i dla klas dziedziczących (podklas)
//   private — dostępne tylko wewnątrz tej klasy
//   (brak)  — dostępne tylko w tym samym pakiecie (package-private)
// ═══════════════════════════════════════════════════════════════
public abstract class LogEntry {

    // ─────────────────────────────────────────────────────────
    // POLA (fields) — dane przechowywane w obiekcie.
    // Każdy obiekt (instancja) ma własną kopię tych pól.
    //
    // @Id — to pole to klucz główny tabeli w bazie danych
    // @GeneratedValue — wartość generowana automatycznie (UUID)
    // private — pole widoczne tylko wewnątrz tej klasy;
    //           dostęp z zewnątrz wyłącznie przez gettery.
    // ─────────────────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;          // unikalny identyfikator wpisu (np. "a1b2-c3d4-...")

    @Column(nullable = false) // w bazie danych kolumna NIE może być NULL
    private UUID userId;      // do którego użytkownika należy ten wpis

    @Column(nullable = false)
    private LocalDate date;   // data wpisu, np. LocalDate.of(2024, 3, 28)

    // @Embedded — dane z EnvironmentalContext są "wbudowane"
    // w tę samą tabelę (nie osobna tabela z kluczem obcym).
    @Embedded
    private EnvironmentalContext environmentalContext; // pogoda + księżyc

    // ─────────────────────────────────────────────────────────
    // KONSTRUKTORY (constructors) — specjalne metody wywoływane
    // przy tworzeniu obiektu: new SleepLog(userId, date, ctx, ...)
    //
    // Konstruktor ma TĘ SAMĄ nazwę co klasa i BRAK typu zwracanego.
    // "protected" — może być wywołany tylko przez podklasy.
    //
    // Konstruktor bezargumentowy (no-args) jest WYMAGANY przez JPA
    // do odtwarzania obiektów z bazy danych (Hibernate używa refleksji).
    // ─────────────────────────────────────────────────────────
    protected LogEntry() {
        // Pusty — JPA potrzebuje konstruktora bez argumentów.
        // Bez niego Hibernate rzuci wyjątek przy odczycie z bazy.
    }

    // Konstruktor właściwy — wywołują go podklasy przez super(...)
    protected LogEntry(UUID userId, LocalDate date, EnvironmentalContext context) {
        // Objects.requireNonNull — jeśli argument jest null,
        // rzuca NullPointerException z czytelnym komunikatem.
        // To "defensive programming" — lepiej wybuchnąć wcześnie
        // z dobrym komunikatem niż crashować gdzieś indziej.
        this.userId = Objects.requireNonNull(userId, "userId cannot be null");
        this.date   = Objects.requireNonNull(date,   "date cannot be null");
        this.environmentalContext = Objects.requireNonNull(context, "environmentalContext cannot be null");
        // "this" odwołuje się do bieżącego obiektu —
        // rozróżnia pole "this.userId" od parametru "userId".
    }

    // ─────────────────────────────────────────────────────────
    // METODA ABSTRAKCYJNA (abstract method)
    // - Brak ciała (brak klamr {}) — tylko sygnatura + średnik.
    // - Każda konkretna podklasa MUSI ją nadpisać (@Override).
    // - Polimorfizm: ten sam kod może pracować na SleepLog,
    //   MoodLog i DreamLog — każdy liczy wellness inaczej.
    //
    // SYGNATURA METODY: [modyfikator] [typ_zwracany] [nazwa]([parametry])
    //   public  abstract  int  calculateWellnessScore()
    //   ↑modif  ↑keyword  ↑ret ↑nazwa                ↑brak parametrów
    // ─────────────────────────────────────────────────────────
    public abstract int calculateWellnessScore();

    // ─────────────────────────────────────────────────────────
    // METODY CHRONIONE (protected) — "pomocniki" dla podklas.
    // Ukrywają szczegóły nawigacji po zagnieżdżonych obiektach.
    // To wzorzec "Law of Demeter" — nie pisz a.getB().getC().getD()
    // ─────────────────────────────────────────────────────────

    // Typ zwracany: double — liczba zmiennoprzecinkowa 64-bit
    protected double getPressureHpa() {
        return environmentalContext.getWeatherData().getPressureHpa();
    }

    // Typ zwracany: enum MoonPhase — jedna z predefiniowanych stałych
    protected MoonData.MoonPhase getMoonPhase() {
        return environmentalContext.getMoonData().getPhase();
    }

    // Typ zwracany: boolean — true lub false
    protected boolean isFullMoon() {
        return environmentalContext.getMoonData().isFullMoon();
    }

    protected boolean isLowPressure() {
        return environmentalContext.getWeatherData().isLowPressure();
    }

    // ─────────────────────────────────────────────────────────
    // GETTERY (getters) — jedyna droga odczytu pól prywatnych.
    // Wzorzec enkapsulacji: pola są "private", dostęp przez metody.
    // Brak setterów — dziennik jest "append-only" (niezmienialny
    // po zapisaniu), co zapobiega niechcianym modyfikacjom.
    //
    // TYPY ZWRACANE:
    //   UUID       — klasa reprezentująca universally unique identifier
    //   LocalDate  — data (bez czasu, bez strefy czasowej)
    //   EnvironmentalContext — własna klasa z tego projektu
    // ─────────────────────────────────────────────────────────
    public UUID getId() {
        return id;   // "return" kończy metodę i zwraca wartość
    }

    public UUID getUserId() {
        return userId;
    }

    public LocalDate getDate() {
        return date;
    }

    public EnvironmentalContext getEnvironmentalContext() {
        return environmentalContext;
    }
}
