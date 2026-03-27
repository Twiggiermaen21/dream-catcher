package com.dreamcatcher.service;

import com.dreamcatcher.domain.context.MoonData;
import com.dreamcatcher.domain.core.MoodLog;
import com.dreamcatcher.domain.core.SleepLog;
import com.dreamcatcher.repository.MoodLogRepository;
import com.dreamcatcher.repository.SleepLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class InsightsEngineService {

    private final SleepLogRepository sleepLogRepository;
    private final MoodLogRepository moodLogRepository;

    public InsightsEngineService(SleepLogRepository sleepLogRepository,
                                 MoodLogRepository moodLogRepository) {
        this.sleepLogRepository = sleepLogRepository;
        this.moodLogRepository = moodLogRepository;
    }

    public List<CorrelationInsight> computeCorrelations(UUID userId, int periodDays) {
        LocalDate from = LocalDate.now().minusDays(periodDays);
        List<SleepLog> sleepLogs = sleepLogRepository.findByUserIdAndDateBetweenOrderByDateAsc(userId, from, LocalDate.now());
        List<MoodLog>  moodLogs  = moodLogRepository.findByUserIdAndDateBetweenOrderByDateAsc(userId, from, LocalDate.now());

        List<CorrelationInsight> insights = new ArrayList<>();

        if (sleepLogs.size() >= 5) {
            insights.add(fullMoonSleepCorrelation(sleepLogs));
            insights.add(lowPressureSleepCorrelation(sleepLogs));
        }
        if (moodLogs.size() >= 5) {
            insights.add(lowPressureMoodCorrelation(moodLogs));
            insights.add(fullMoonMoodCorrelation(moodLogs));
        }

        return insights;
    }

    // ── Korelacje: księżyc × sen ────────────────────────────────────────────

    private CorrelationInsight fullMoonSleepCorrelation(List<SleepLog> logs) {
        double avgFullMoon   = logs.stream()
                .filter(l -> l.getEnvironmentalContext().getMoonData().isFullMoon())
                .mapToInt(SleepLog::getSleepQualityRating)
                .average().orElse(0);

        double avgOtherMoon  = logs.stream()
                .filter(l -> !l.getEnvironmentalContext().getMoonData().isFullMoon())
                .mapToInt(SleepLog::getSleepQualityRating)
                .average().orElse(0);

        double diff = avgFullMoon - avgOtherMoon;
        double coeff = avgOtherMoon > 0 ? diff / avgOtherMoon : 0;

        String insight = diff < -0.5
                ? "Twój sen podczas pełni księżyca jest o %.0f%% gorszy niż w inne noce".formatted(Math.abs(diff / avgOtherMoon * 100))
                : "Pełnia księżyca nie wpływa znacząco na Twój sen";

        return new CorrelationInsight("FULL_MOON", "SLEEP_QUALITY", coeff, insight, (int) logs.stream().filter(l -> l.getEnvironmentalContext().getMoonData().isFullMoon()).count());
    }

    private CorrelationInsight lowPressureSleepCorrelation(List<SleepLog> logs) {
        double avgLow  = logs.stream()
                .filter(l -> l.getEnvironmentalContext().getWeatherData().isLowPressure())
                .mapToInt(SleepLog::getSleepQualityRating)
                .average().orElse(0);

        double avgHigh = logs.stream()
                .filter(l -> !l.getEnvironmentalContext().getWeatherData().isLowPressure())
                .mapToInt(SleepLog::getSleepQualityRating)
                .average().orElse(0);

        double coeff = avgHigh > 0 ? (avgLow - avgHigh) / avgHigh : 0;
        String insight = avgLow < avgHigh
                ? "Przy niskim ciśnieniu (< 1000 hPa) jakość Twojego snu spada o %.1f pkt".formatted(avgHigh - avgLow)
                : "Ciśnienie atmosferyczne nie wpływa istotnie na Twój sen";

        return new CorrelationInsight("LOW_PRESSURE", "SLEEP_QUALITY", coeff, insight,
                (int) logs.stream().filter(l -> l.getEnvironmentalContext().getWeatherData().isLowPressure()).count());
    }

    // ── Korelacje: ciśnienie × nastrój ─────────────────────────────────────

    private CorrelationInsight lowPressureMoodCorrelation(List<MoodLog> logs) {
        double avgLow  = logs.stream()
                .filter(l -> l.getEnvironmentalContext().getWeatherData().isLowPressure())
                .mapToInt(l -> l.getEveningMood().ordinal())
                .average().orElse(0);

        double avgHigh = logs.stream()
                .filter(l -> !l.getEnvironmentalContext().getWeatherData().isLowPressure())
                .mapToInt(l -> l.getEveningMood().ordinal())
                .average().orElse(0);

        double coeff = avgHigh > 0 ? (avgLow - avgHigh) / avgHigh : 0;
        String insight = avgLow > avgHigh
                ? "Przy niskim ciśnieniu Twój nastrój wieczorny spada o %.1f poziomy".formatted(avgLow - avgHigh)
                : "Ciśnienie nie wpływa wyraźnie na Twój nastrój";

        return new CorrelationInsight("LOW_PRESSURE", "MOOD_EVENING", coeff, insight,
                (int) logs.stream().filter(l -> l.getEnvironmentalContext().getWeatherData().isLowPressure()).count());
    }

    private CorrelationInsight fullMoonMoodCorrelation(List<MoodLog> logs) {
        double avgFull  = logs.stream()
                .filter(l -> l.getEnvironmentalContext().getMoonData().getPhase() == MoonData.MoonPhase.FULL_MOON)
                .mapToInt(l -> l.getEveningMood().ordinal())
                .average().orElse(0);

        double avgOther = logs.stream()
                .filter(l -> l.getEnvironmentalContext().getMoonData().getPhase() != MoonData.MoonPhase.FULL_MOON)
                .mapToInt(l -> l.getEveningMood().ordinal())
                .average().orElse(0);

        double coeff = avgOther > 0 ? (avgFull - avgOther) / avgOther : 0;
        String insight = avgFull > avgOther + 0.3
                ? "Twój nastrój podczas pełni księżyca jest bardziej niestabilny"
                : "Pełnia księżyca nie wpływa wyraźnie na Twój nastrój";

        return new CorrelationInsight("FULL_MOON", "MOOD_EVENING", coeff, insight,
                (int) logs.stream().filter(l -> l.getEnvironmentalContext().getMoonData().isFullMoon()).count());
    }

    // ── DTO wyniku ──────────────────────────────────────────────────────────

    public record CorrelationInsight(
            String factor,
            String metric,
            double correlationCoeff,
            String insight,
            int sampleSize
    ) {}
}
