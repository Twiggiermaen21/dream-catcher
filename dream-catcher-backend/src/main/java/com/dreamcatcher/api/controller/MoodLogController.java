package com.dreamcatcher.api.controller;

// ═══════════════════════════════════════════════════════════════
// WARSTWA KONTROLERA (Controller Layer)
//
// Zadanie kontrolera:
//   1. Odbierz żądanie HTTP (GET, POST...)
//   2. Wyciągnij dane z żądania (body, nagłówki, atrybuty)
//   3. Deleguj logikę do serwisu
//   4. Opakuj wynik w odpowiedź HTTP i zwróć
//
// Kontroler NIE zawiera logiki biznesowej — tylko "routing".
// ═══════════════════════════════════════════════════════════════

import com.dreamcatcher.api.dto.request.CreateMoodLogRequest;
import com.dreamcatcher.domain.core.MoodLog;
import com.dreamcatcher.service.MoodLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// ─────────────────────────────────────────────────────────────
// @RestController = @Controller + @ResponseBody
//
//   @Controller     — klasa obsługuje żądania HTTP
//   @ResponseBody   — wartości zwracane przez metody są
//                     automatycznie serializowane do JSON
//                     (Jackson ObjectMapper robi to za nas)
//
// Bez @ResponseBody metoda próbowałaby zwrócić widok (HTML template).
// Z @ResponseBody: zwrócony obiekt Java → JSON w ciele odpowiedzi.
//
// @RequestMapping("/api/v1/logs/mood") — bazowy URL dla wszystkich
// metod tej klasy. Żądania do /api/v1/logs/mood trafiają tutaj.
// ─────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/v1/logs/mood")
public class MoodLogController {

    // ─────────────────────────────────────────────────────────
    // Pole serwisu — private final (enkapsulacja + niezmienność).
    // Wstrzykiwane przez konstruktor (constructor injection).
    // ─────────────────────────────────────────────────────────
    private final MoodLogService moodLogService;

    // Konstruktor — Spring automatycznie wstrzykuje MoodLogService
    // z kontenera aplikacji (IoC Container).
    public MoodLogController(MoodLogService moodLogService) {
        this.moodLogService = moodLogService;
    }

    // ─────────────────────────────────────────────────────────
    // @PostMapping — ta metoda obsługuje żądania HTTP POST
    // na URL /api/v1/logs/mood
    //
    // HTTP POST = tworzenie nowego zasobu (Create w CRUD).
    // Inne metody HTTP:
    //   GET    — odczyt danych (bez efektów ubocznych)
    //   POST   — tworzenie nowego zasobu
    //   PUT    — pełna aktualizacja zasobu
    //   PATCH  — częściowa aktualizacja
    //   DELETE — usunięcie zasobu
    //
    // TYP ZWRACANY: ResponseEntity<MoodLog>
    //   ResponseEntity — wrapper pozwalający kontrolować:
    //     - ciało odpowiedzi (body)
    //     - kod statusu HTTP (201 Created, 200 OK, 404 Not Found...)
    //     - nagłówki odpowiedzi (headers)
    //   <MoodLog> — generyk: ciało będzie JSON reprezentujący MoodLog
    // ─────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<MoodLog> createMoodLog(
            // @RequestAttribute — odczytuje atrybut z obiektu żądania.
            // Atrybut "userId" jest ustawiany przez JwtAuthenticationFilter
            // po pomyślnej weryfikacji tokena JWT:
            //   request.setAttribute("userId", jwtService.extractUserId(jwt))
            //
            // To INNY mechanizm niż @RequestHeader (nagłówek HTTP) lub
            // @RequestParam (?userId=123 w URL) czy @PathVariable (/mood/{id}).
            @RequestAttribute("userId") UUID userId,

            // @Valid — uruchamia Bean Validation na obiekcie request.
            // Sprawdza adnotacje: @NotNull, @Min, @Max, @Size, @DecimalMin...
            // Jeśli walidacja się nie powiedzie → 400 Bad Request (automatycznie).
            //
            // @RequestBody — deserializuje ciało żądania HTTP (JSON)
            // na obiekt Java (CreateMoodLogRequest Record).
            // Jackson ObjectMapper robi: JSON string → Java object.
            @Valid @RequestBody CreateMoodLogRequest request) {

        // Delegacja do serwisu — kontroler nie wie "jak" stworzyć log,
        // wie tylko "że" powinien go stworzyć i komu go zwrócić.
        MoodLog created = moodLogService.createMoodLog(userId, request);

        // ResponseEntity.status(HttpStatus.CREATED) — ustawia kod 201.
        // .body(created) — ustawia ciało odpowiedzi (JSON).
        //
        // HTTP 201 Created = zasób został pomyślnie utworzony.
        // (vs 200 OK który jest domyślny dla odczytów)
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ─────────────────────────────────────────────────────────
    // @GetMapping — obsługuje żądania HTTP GET na /api/v1/logs/mood
    //
    // HTTP GET = pobierz dane. Idempotentny — wielokrotne wywołanie
    // daje ten sam wynik i nie zmienia stanu serwera.
    //
    // TYP ZWRACANY: ResponseEntity<List<MoodLog>>
    //   List<MoodLog> — lista obiektów → zostanie zwrócona jako
    //   tablica JSON: [{"id":"...", "date":"...", ...}, ...]
    // ─────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<MoodLog>> getMoodLogs(
            @RequestAttribute("userId") UUID userId) {

        // ResponseEntity.ok(...) — skrót dla ResponseEntity z kodem 200 OK.
        // Semantycznie: "żądanie było poprawne, oto dane".
        return ResponseEntity.ok(moodLogService.getUserLogs(userId));
    }
}
