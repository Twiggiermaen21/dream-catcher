package com.dreamcatcher.api.controller;

import com.dreamcatcher.api.dto.request.CreateDreamLogRequest;
import com.dreamcatcher.domain.core.DreamLog;
import com.dreamcatcher.service.DreamLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.lang.NonNull;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/logs/dreams")
public class DreamLogController {

    private final DreamLogService dreamLogService;

    public DreamLogController(DreamLogService dreamLogService) {
        this.dreamLogService = dreamLogService;
    }

    @PostMapping
    public ResponseEntity<DreamLog> createDreamLog(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody CreateDreamLogRequest request) {

        DreamLog created = dreamLogService.createDreamLog(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<DreamLog>> getDreamLogs(
            @RequestAttribute("userId") UUID userId) {

        return ResponseEntity.ok(dreamLogService.getUserLogs(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDreamLog(
            @RequestAttribute("userId") UUID userId,
            @PathVariable @NonNull UUID id) {
        dreamLogService.deleteLog(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DreamLog> replaceDreamLog(
            @RequestAttribute("userId") UUID userId,
            @PathVariable @NonNull UUID id,
            @Valid @RequestBody CreateDreamLogRequest request) {
        return ResponseEntity.ok(dreamLogService.replaceLog(userId, id, request));
    }
}
