package com.dreamcatcher.domain.core;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.context.MoonData;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@MappedSuperclass
public abstract class LogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private LocalDate date;

    @Embedded
    private EnvironmentalContext environmentalContext;

    protected LogEntry() {}

    protected LogEntry(UUID userId, LocalDate date, EnvironmentalContext context) {
        this.userId = Objects.requireNonNull(userId, "userId cannot be null");
        this.date   = Objects.requireNonNull(date,   "date cannot be null");
        this.environmentalContext = Objects.requireNonNull(context, "environmentalContext cannot be null");
    }

    // Każda podklasa definiuje własną logikę wyliczania wellness
    public abstract int calculateWellnessScore();

    // Convenience accessors dla podklas — ukrywają szczegóły kompozycji
    protected double getPressureHpa() {
        return environmentalContext.getWeatherData().getPressureHpa();
    }

    protected MoonData.MoonPhase getMoonPhase() {
        return environmentalContext.getMoonData().getPhase();
    }

    protected boolean isFullMoon() {
        return environmentalContext.getMoonData().isFullMoon();
    }

    protected boolean isLowPressure() {
        return environmentalContext.getWeatherData().isLowPressure();
    }

    // Gettery — enkapsulacja, brak setterów (append-only journal)
    public UUID getId()                                        { return id; }
    public UUID getUserId()                                    { return userId; }
    public LocalDate getDate()                                 { return date; }
    public EnvironmentalContext getEnvironmentalContext()      { return environmentalContext; }
}
