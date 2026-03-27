package com.dreamcatcher.domain.core;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import jakarta.persistence.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "sleep_logs")
public final class SleepLog extends LogEntry {

    @Column(nullable = false)
    private LocalTime bedtime;

    @Column(nullable = false)
    private LocalTime wakeTime;

    @Column(nullable = false)
    private int sleepQualityRating;   // 1–10, ocena własna użytkownika

    private boolean hadNightmares;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sleep_log_rituals", joinColumns = @JoinColumn(name = "sleep_log_id"))
    @Column(name = "ritual")
    private List<String> eveningRituals;  // np. "herbata", "medytacja", "brak ekranów"

    protected SleepLog() {}

    public SleepLog(UUID userId, LocalDate date, EnvironmentalContext context,
                    LocalTime bedtime, LocalTime wakeTime,
                    int sleepQualityRating, boolean hadNightmares,
                    List<String> eveningRituals) {
        super(userId, date, context);
        if (sleepQualityRating < 1 || sleepQualityRating > 10) {
            throw new IllegalArgumentException("sleepQualityRating must be 1–10, got: " + sleepQualityRating);
        }
        this.bedtime = Objects.requireNonNull(bedtime, "bedtime cannot be null");
        this.wakeTime = Objects.requireNonNull(wakeTime, "wakeTime cannot be null");
        this.sleepQualityRating = sleepQualityRating;
        this.hadNightmares = hadNightmares;
        this.eveningRituals = eveningRituals != null ? List.copyOf(eveningRituals) : List.of();
    }

    @Override
    public int calculateWellnessScore() {
        int score = sleepQualityRating * 8;       // max 80 pkt z oceny własnej

        // Czynniki środowiskowe
        if (isFullMoon())    score -= 10;          // pełnia księżyca = gorszy sen
        if (isLowPressure()) score -= 8;           // niskie ciśnienie = niewyspanie
        if (hadNightmares)   score -= 15;          // koszmary mocno obniżają wynik

        // Czas snu – bonus za odpowiednią długość (7–9h)
        long minutes = getSleepDurationMinutes();
        if (minutes >= 420 && minutes <= 540) score += 10;  // 7–9 godzin
        else if (minutes < 360)              score -= 10;   // poniżej 6h

        // Bonus za rytuały wieczorne
        score += Math.min(eveningRituals.size() * 3, 12);

        return Math.max(0, Math.min(100, score));
    }

    public long getSleepDurationMinutes() {
        Duration d = Duration.between(bedtime, wakeTime);
        // Obsługa snu po północy (wakeTime < bedtime)
        return d.isNegative() ? d.plusHours(24).toMinutes() : d.toMinutes();
    }

    public LocalTime getBedtime()           { return bedtime; }
    public LocalTime getWakeTime()          { return wakeTime; }
    public int getSleepQualityRating()      { return sleepQualityRating; }
    public boolean isHadNightmares()        { return hadNightmares; }
    public List<String> getEveningRituals() { return eveningRituals; }
}
