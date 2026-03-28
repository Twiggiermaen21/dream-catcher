package com.dreamcatcher.api.controller;

import com.dreamcatcher.service.InsightsEngineService;
import com.dreamcatcher.service.InsightsEngineService.CorrelationInsight;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/insights")
@CrossOrigin(origins = "http://localhost:5173")
public class InsightsController {

    private final InsightsEngineService insightsEngineService;

    public InsightsController(InsightsEngineService insightsEngineService) {
        this.insightsEngineService = insightsEngineService;
    }

    @GetMapping("/correlations")
    public ResponseEntity<List<CorrelationInsight>> getCorrelations(
            @RequestAttribute("userId") UUID userId,
            @RequestParam(defaultValue = "30") int periodDays) {

        List<CorrelationInsight> insights = insightsEngineService.computeCorrelations(userId, periodDays);
        return ResponseEntity.ok(insights);
    }
}
