package com.dreamcatcher.api.controller;

import com.dreamcatcher.api.dto.request.CreateSleepLogRequest;
import com.dreamcatcher.domain.core.SleepLog;
import com.dreamcatcher.service.SleepLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateSleepLogRequest request) {

        SleepLog created = sleepLogService.createSleepLog(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<SleepLog>> getSleepLogs(
            @RequestHeader("X-User-Id") UUID userId) {

        return ResponseEntity.ok(sleepLogService.getUserLogs(userId));
    }
}
