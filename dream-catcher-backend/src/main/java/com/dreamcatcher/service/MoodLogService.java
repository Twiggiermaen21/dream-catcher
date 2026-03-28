package com.dreamcatcher.service;

// ═══════════════════════════════════════════════════════════════
// WARSTWA SERWISOWA (Service Layer) — "serce" aplikacji.
//
// Architektura warstw (Layered Architecture):
//   1. Controller  — odbiera żądania HTTP, zwraca odpowiedzi
//   2. Service     ← JESTEŚMY TUTAJ — logika biznesowa
//   3. Repository  — dostęp do bazy danych
//
// Serwis nie wie nic o HTTP. Operuje na obiektach domenowych.
// Dzięki temu można go testować bez uruchamiania serwera HTTP.
// ═══════════════════════════════════════════════════════════════

import com.dreamcatcher.api.dto.request.CreateMoodLogRequest;
import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.core.MoodLog;
import com.dreamcatcher.integration.aggregator.ExternalDataAggregatorService;
import com.dreamcatcher.repository.MoodLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// ─────────────────────────────────────────────────────────────
// @Service — adnotacja Spring.
// Oznacza że ta klasa to "serwis" — komponent warstwy logiki.
// Spring automatycznie tworzy jeden obiekt tej klasy (singleton)
// i umieszcza go w "kontenerze" (Application Context).
//
// @Service = @Component z semantycznym znaczeniem.
// Inne podobne: @Controller (warstwa HTTP), @Repository (baza).
//
// SINGLETON — jeden wspólny obiekt dla całej aplikacji.
//   MoodLogService instance1 = context.getBean(MoodLogService.class);
//   MoodLogService instance2 = context.getBean(MoodLogService.class);
//   instance1 == instance2  ← TRUE! To ten sam obiekt.
//
// @Transactional — wszystkie metody tej klasy domyślnie
// wykonują się w transakcji bazodanowej.
//
// TRANSAKCJA = operacje wykonywane jako całość:
//   - albo wszystkie się udają (COMMIT)
//   - albo żadna nie jest zapisana (ROLLBACK)
//
// Przykład: przelew bankowy = pobierz z konta A + dodaj do B.
// Jeśli krok 2 się posypie, krok 1 też jest cofany.
// ─────────────────────────────────────────────────────────────
@Service
@Transactional
public class MoodLogService {

    // ─────────────────────────────────────────────────────────
    // POLA — zależności wstrzykiwane przez Spring (DI).
    //
    // DEPENDENCY INJECTION (wstrzykiwanie zależności):
    //   Zamiast pisać: this.repository = new MoodLogRepository()
    //   pozwalamy Springowi wstrzyknąć gotowy obiekt.
    //
    // Korzyści:
    //   1. Łatwe testowanie — można podmienić na "fałszywy" obiekt (mock)
    //   2. Loose coupling — serwis nie tworzy swoich zależności
    //   3. Spring zarządza cyklem życia obiektów
    //
    // final — pole może być przypisane tylko raz (w konstruktorze).
    //   Gwarantuje niezmienność po inicjalizacji.
    // ─────────────────────────────────────────────────────────
    private final MoodLogRepository repository;
    private final ExternalDataAggregatorService aggregator;

    // ─────────────────────────────────────────────────────────
    // KONSTRUKTOR — Spring widzi konstruktor z parametrami
    // i automatycznie wstrzykuje odpowiednie obiekty z kontenera.
    //
    // To tzw. "constructor injection" — preferowany sposób DI.
    //   vs. "field injection" (@Autowired na polu) — starszy,
    //       trudniejszy do testowania, Spring team odradza.
    //
    // Jak działa:
    //   1. Spring startuje aplikację
    //   2. Tworzy obiekty: MoodLogRepository, ExternalDataAggregatorService
    //   3. Tworzy MoodLogService, przekazując je do konstruktora
    //   4. Przechowuje gotowy MoodLogService w kontenerze
    // ─────────────────────────────────────────────────────────
    public MoodLogService(MoodLogRepository repository,
                          ExternalDataAggregatorService aggregator) {
        this.repository = repository;
        this.aggregator = aggregator;
    }

    // ─────────────────────────────────────────────────────────
    // METODA createMoodLog — główna logika tworzenia wpisu nastroju.
    //
    // SYGNATURA:
    //   public MoodLog createMoodLog(UUID userId, CreateMoodLogRequest request)
    //   ↑modif ↑zwraca  ↑nazwa       ↑param1      ↑param2
    //
    // PARAMETRY:
    //   UUID userId              — kto tworzy wpis (z JWT tokena)
    //   CreateMoodLogRequest     — dane z formularza (DTO / Record)
    //
    // TYP ZWRACANY:
    //   MoodLog — obiekt encji zapisany w bazie (z wygenerowanym id)
    //
    // PRZEPŁYW (flow):
    //   1. Pobierz dane pogody i księżyca z zewnętrznych API
    //   2. Utwórz nowy obiekt MoodLog
    //   3. Zapisz go w bazie danych
    //   4. Zwróć zapisany obiekt (teraz ma id z bazy)
    // ─────────────────────────────────────────────────────────
    public MoodLog createMoodLog(UUID userId, CreateMoodLogRequest request) {

        // Krok 1: Zbuduj EnvironmentalContext (pogoda + księżyc).
        // aggregator.buildContextFor() wywoła zewnętrzne API
        // (WeatherAPI.com) na podstawie daty i współrzędnych GPS.
        //
        // request.date()      — metoda akcesor Rekordu (bez "get")
        // request.latitude()  — szerokość geogr. z formularza
        // request.longitude() — długość geogr. z formularza
        EnvironmentalContext context = aggregator.buildContextFor(
                request.date(),
                request.latitude(),
                request.longitude()
        );

        // Krok 2: Utwórz obiekt MoodLog.
        // "new MoodLog(...)" wywołuje konstruktor klasy MoodLog
        // który sprawdza zakresy (energyLevel 1-10) i nulle.
        //
        // Konstruktor MoodLog przyjmuje 8 parametrów:
        //   userId, date, context, morningMood, eveningMood,
        //   energyLevel, stressLevel, notes
        MoodLog log = new MoodLog(
                userId,
                request.date(),
                context,
                request.morningMood(),    // enum MoodType (np. HAPPY)
                request.eveningMood(),    // enum MoodType
                request.energyLevel(),   // int 1-10
                request.stressLevel(),   // int 1-10
                request.notes()          // String (może być null)
        );

        // Krok 3: Zapisz w bazie i zwróć.
        // repository.save(log) to metoda Spring Data JPA.
        // Po zapisaniu obiekt "log" ma wypełnione pole "id"
        // (wcześniej było null — Hibernate generuje UUID przy zapisie).
        //
        // RETURN — kończy metodę i zwraca wartość do wywołującego.
        return repository.save(log);
    }

    // ─────────────────────────────────────────────────────────
    // @Transactional(readOnly = true) — nadpisuje domyślną
    // adnotację klasy dla TEJ metody.
    //
    // readOnly = true:
    //   - Informuje bazę: "tylko odczyt, bez modyfikacji"
    //   - Optymalizacja: Hibernate nie śledzi zmian (dirty checking)
    //   - Szybsze działanie przy dużych listach danych
    //   - Zapobiega przypadkowym zapisom w metodach odczytowych
    //
    // TYP ZWRACANY: List<MoodLog>
    //   List — interfejs kolekcji (może być ArrayList, LinkedList...)
    //   <MoodLog> — GENERYK — lista zawiera TYLKO obiekty MoodLog.
    //   Bez generyka byłoby: List — "surowy typ", nie polecane.
    // ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MoodLog> getUserLogs(UUID userId) {
        // Wywołanie metody zapytania z repozytorium.
        // Spring Data JPA automatycznie generuje SQL na podstawie nazwy:
        //   findByUserIdOrderByDateDesc
        //   ↑find    ↑where userId=?   ↑ORDER BY date DESC
        //
        // Wynikowy SQL (przybliżony):
        //   SELECT * FROM mood_logs WHERE user_id = ? ORDER BY date DESC
        return repository.findByUserIdOrderByDateDesc(userId);
    }
}
