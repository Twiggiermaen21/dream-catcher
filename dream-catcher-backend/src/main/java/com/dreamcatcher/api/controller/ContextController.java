package com.dreamcatcher.api.controller;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.integration.aggregator.ExternalDataAggregatorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/context")
@CrossOrigin(origins = "http://localhost:5173")
public class ContextController {

    private final ExternalDataAggregatorService aggregator;

    public ContextController(ExternalDataAggregatorService aggregator) {
        this.aggregator = aggregator;
    }

    @GetMapping("/today")
    public ResponseEntity<EnvironmentalContext> getTodayContext(
            @RequestParam double lat,
            @RequestParam double lon) {

        return ResponseEntity.ok(aggregator.buildContextFor(LocalDate.now(), lat, lon));
    }

    @GetMapping("/date")
    public ResponseEntity<EnvironmentalContext> getContextForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam double lat,
            @RequestParam double lon) {

        return ResponseEntity.ok(aggregator.buildContextFor(date, lat, lon));
    }
}
