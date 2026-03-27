package com.dreamcatcher.domain.core;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "mood_logs")
public final class MoodLog extends LogEntry {

    public enum MoodType {
        EUPHORIC, HAPPY, NEUTRAL, ANXIOUS, SAD, IRRITABLE, EXHAUSTED
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodType morningMood;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodType eveningMood;

    @Column(nullable = false)
    private int energyLevel;    // 1–10

    @Column(nullable = false)
    private int stressLevel;    // 1–10

    @Column(length = 1000)
    private String notes;

    protected MoodLog() {}

    public MoodLog(UUID userId, LocalDate date, EnvironmentalContext context,
                   MoodType morningMood, MoodType eveningMood,
                   int energyLevel, int stressLevel, String notes) {
        super(userId, date, context);
        if (energyLevel < 1 || energyLevel > 10)
            throw new IllegalArgumentException("energyLevel must be 1–10");
        if (stressLevel < 1 || stressLevel > 10)
            throw new IllegalArgumentException("stressLevel must be 1–10");
        this.morningMood = Objects.requireNonNull(morningMood, "morningMood cannot be null");
        this.eveningMood = Objects.requireNonNull(eveningMood, "eveningMood cannot be null");
        this.energyLevel = energyLevel;
        this.stressLevel = stressLevel;
        this.notes = notes;
    }

    @Override
    public int calculateWellnessScore() {
        int moodScore = switch (eveningMood) {
            case EUPHORIC  -> 100;
            case HAPPY     -> 80;
            case NEUTRAL   -> 60;
            case ANXIOUS   -> 40;
            case SAD       -> 30;
            case IRRITABLE -> 25;
            case EXHAUSTED -> 20;
        };

        // Środowisko wpływa na nastrój
        if (isLowPressure()) moodScore -= 10;
        if (isFullMoon())    moodScore -= 5;

        int finalScore = (moodScore + energyLevel * 5 - stressLevel * 5) / 2;
        return Math.max(0, Math.min(100, finalScore));
    }

    public boolean isMoodImproved() {
        return eveningMood.ordinal() < morningMood.ordinal();  // niższy ordinal = lepszy nastrój
    }

    public MoodType getMorningMood()  { return morningMood; }
    public MoodType getEveningMood()  { return eveningMood; }
    public int getEnergyLevel()       { return energyLevel; }
    public int getStressLevel()       { return stressLevel; }
    public String getNotes()          { return notes; }
}
