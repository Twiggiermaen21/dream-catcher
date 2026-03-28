package com.dreamcatcher.service;

// ═══════════════════════════════════════════════════════════════
// Serwis warstwy logiki dla wpisów snu (SleepLog).
// Wzorzec identyczny jak MoodLogService — różni się tylko
// typem encji (SleepLog) i polami żądania (bedtime, wakeTime...).
//
// ZASADA DRY (Don't Repeat Yourself) — tu celowo powtarzamy,
// bo każdy log może mieć inną logikę w przyszłości.
// ═══════════════════════════════════════════════════════════════

import com.dreamcatcher.api.dto.request.CreateSleepLogRequest;
import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.core.SleepLog;
import com.dreamcatcher.integration.aggregator.ExternalDataAggregatorService;
import com.dreamcatcher.repository.SleepLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

// @Service — rejestruje klasę jako komponent Spring (singleton).
// @Transactional — każda metoda domyślnie otwiera transakcję DB.
@Service
@Transactional
public class SleepLogService {

    // Zależności wstrzykiwane przez konstruktor (constructor injection).
    // SleepLogRepository — dostęp do tabeli sleep_logs w bazie.
    // ExternalDataAggregatorService — pobiera dane pogody + księżyca.
    private final SleepLogRepository repository;
    private final ExternalDataAggregatorService aggregator;

    // Konstruktor — Spring automatycznie dostarcza obiekty z kontenera.
    public SleepLogService(SleepLogRepository repository,
                           ExternalDataAggregatorService aggregator) {
        this.repository = repository;
        this.aggregator = aggregator;
    }

    // ─────────────────────────────────────────────────────────
    // Tworzy nowy wpis snu i zapisuje w bazie.
    //
    // TYP ZWRACANY: SleepLog
    //   Zwracamy obiekt ENCJI (nie DTO) — Spring/Jackson
    //   automatycznie skonwertuje go do JSON gdy kontroler
    //   zwróci go w ResponseEntity.
    //   Po zapisie obiekt ma wypełnione pole "id" (UUID z bazy).
    // ─────────────────────────────────────────────────────────
    public SleepLog createSleepLog(UUID userId, CreateSleepLogRequest request) {

        // Pobiera dane środowiskowe automatycznie przy tworzeniu wpisu.
        // buildContextFor() wywoła zewnętrzne API (WeatherAPI.com)
        // i zwróci EnvironmentalContext (pogoda + dane księżyca).
        EnvironmentalContext context = aggregator.buildContextFor(
                request.date(),      // akcesor Rekordu (nie getDate())
                request.latitude(),
                request.longitude()
        );

        // Tworzy obiekt domenowy SleepLog.
        // Konstruktor SleepLog waliduje dane (np. sleepQualityRating 1-10)
        // i rzuca IllegalArgumentException jeśli dane są niepoprawne.
        SleepLog log = new SleepLog(
                userId,
                request.date(),
                context,
                request.bedtime(),             // LocalTime — pora snu
                request.wakeTime(),            // LocalTime — pora wstania
                request.sleepQualityRating(),  // int 1-10
                request.hadNightmares(),       // boolean
                request.eveningRituals()       // List<String>
        );

        // Zapisuje w bazie i zwraca obiekt z wypełnionym id.
        // Spring Data JPA: jeśli id == null → INSERT, jeśli id != null → UPDATE.
        return repository.save(log);
    }

    // ─────────────────────────────────────────────────────────
    // readOnly = true — optymalizacja dla operacji tylko do odczytu.
    // Hibernate nie będzie śledził zmian w obiektach (dirty checking),
    // co przyspiesza wykonanie zapytania.
    // ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<SleepLog> getUserLogs(UUID userId) {
        // Metoda z repozytorium — Spring Data generuje SQL automatycznie:
        //   SELECT * FROM sleep_logs WHERE user_id = ? ORDER BY date DESC
        return repository.findByUserIdOrderByDateDesc(userId);
    }

    public void deleteLog(UUID userId, @NonNull UUID logId) {
        SleepLog log = repository.findById(logId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SleepLog not found"));
        if (!log.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        repository.delete(log);
    }

    public SleepLog replaceLog(UUID userId, @NonNull UUID logId, CreateSleepLogRequest request) {
        deleteLog(userId, logId);
        return createSleepLog(userId, request);
    }
}
