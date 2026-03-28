package com.dreamcatcher.api.controller;

import com.dreamcatcher.api.dto.request.CreateMoodLogRequest;
import com.dreamcatcher.domain.core.MoodLog;
import com.dreamcatcher.service.MoodLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/logs/mood")
public class MoodLogController {

    private final MoodLogService moodLogService;

    public MoodLogController(MoodLogService moodLogService) {
        this.moodLogService = moodLogService;
    }

    @PostMapping
    public ResponseEntity<MoodLog> createMoodLog(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody CreateMoodLogRequest request) {

        MoodLog created = moodLogService.createMoodLog(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<MoodLog>> getMoodLogs(
            @RequestAttribute("userId") UUID userId) {

        return ResponseEntity.ok(moodLogService.getUserLogs(userId));
    }
}
