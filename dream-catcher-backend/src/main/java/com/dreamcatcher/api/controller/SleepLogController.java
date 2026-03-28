package com.dreamcatcher.api.controller;

import com.dreamcatcher.api.dto.request.CreateSleepLogRequest;
import com.dreamcatcher.domain.core.SleepLog;
import com.dreamcatcher.service.SleepLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.lang.NonNull;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/logs/sleep")
@CrossOrigin(origins = "http://localhost:5173")
public class SleepLogController {

    private final SleepLogService sleepLogService;

    public SleepLogController(SleepLogService sleepLogService) {
        this.sleepLogService = sleepLogService;
    }

    @PostMapping
    public ResponseEntity<SleepLog> createSleepLog(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody CreateSleepLogRequest request) {

        SleepLog created = sleepLogService.createSleepLog(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<SleepLog>> getSleepLogs(
            @RequestAttribute("userId") UUID userId) {

        return ResponseEntity.ok(sleepLogService.getUserLogs(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSleepLog(
            @RequestAttribute("userId") UUID userId,
            @PathVariable @NonNull UUID id) {
        sleepLogService.deleteLog(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<SleepLog> replaceSleepLog(
            @RequestAttribute("userId") UUID userId,
            @PathVariable @NonNull UUID id,
            @Valid @RequestBody CreateSleepLogRequest request) {
        return ResponseEntity.ok(sleepLogService.replaceLog(userId, id, request));
    }
}
