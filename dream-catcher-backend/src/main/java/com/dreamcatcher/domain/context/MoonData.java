package com.dreamcatcher.domain.context;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.util.Objects;

@Embeddable
public final class MoonData {

    public enum MoonPhase {
        NEW_MOON, WAXING_CRESCENT, FIRST_QUARTER, WAXING_GIBBOUS,
        FULL_MOON, WANING_GIBBOUS, LAST_QUARTER, WANING_CRESCENT
    }

    @Enumerated(EnumType.STRING)
    private MoonPhase phase;

    private double illuminationPercent;
    private double moonAge;  // days since new moon (0-29.5)

    protected MoonData() {}

    public MoonData(MoonPhase phase, double illuminationPercent, double moonAge) {
        this.phase = Objects.requireNonNull(phase, "phase cannot be null");
        if (illuminationPercent < 0 || illuminationPercent > 100) {
            throw new IllegalArgumentException("Illumination must be 0-100: " + illuminationPercent);
        }
        this.illuminationPercent = illuminationPercent;
        this.moonAge = moonAge;
    }

    public boolean isFullMoon()       { return phase == MoonPhase.FULL_MOON; }
    public boolean isNewMoon()        { return phase == MoonPhase.NEW_MOON; }
    public boolean isWaxing() {
        return phase == MoonPhase.WAXING_CRESCENT
            || phase == MoonPhase.FIRST_QUARTER
            || phase == MoonPhase.WAXING_GIBBOUS;
    }

    public String getPhaseEmoji() {
        return switch (phase) {
            case NEW_MOON        -> "🌑";
            case WAXING_CRESCENT -> "🌒";
            case FIRST_QUARTER   -> "🌓";
            case WAXING_GIBBOUS  -> "🌔";
            case FULL_MOON       -> "🌕";
            case WANING_GIBBOUS  -> "🌖";
            case LAST_QUARTER    -> "🌗";
            case WANING_CRESCENT -> "🌘";
        };
    }

    public MoonPhase getPhase()              { return phase; }
    public double getIlluminationPercent()   { return illuminationPercent; }
    public double getMoonAge()               { return moonAge; }

    @Override
    public String toString() {
        return "MoonData{phase=%s, illumination=%.1f%%, age=%.1fd}"
                .formatted(phase, illuminationPercent, moonAge);
    }
}
