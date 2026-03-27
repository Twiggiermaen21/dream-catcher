package com.dreamcatcher.integration.moon;

import com.dreamcatcher.domain.context.MoonData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.ZoneOffset;

@Component
public class FarmsenseClient {

    private final WebClient webClient;
    private final String apiKey;

    public FarmsenseClient(WebClient.Builder builder,
                           @Value("${external-api.farmsense.base-url}") @NonNull String baseUrl,
                           @Value("${external-api.farmsense.api-key:}") @NonNull String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    @Cacheable(value = "moon", key = "#date")
    public MoonData fetchMoonData(LocalDate date) {
        long unixTimestamp = date.atStartOfDay(ZoneOffset.UTC).toEpochSecond();

        FarmsenseResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("d", unixTimestamp)
                        .build())
                .header("X-RapidAPI-Key", apiKey)
                .retrieve()
                .bodyToMono(FarmsenseResponse.class)
                .block();

        if (response == null) {
            // Fallback: oblicz przybliżoną fazę księżyca lokalnie
            return approximateMoonPhase(date);
        }

        MoonData.MoonPhase phase = mapPhaseIndex(response.getPhaseIndex());
        return new MoonData(phase, response.getIllumination(), response.getAge());
    }

    private MoonData.MoonPhase mapPhaseIndex(int index) {
        return switch (index) {
            case 0 -> MoonData.MoonPhase.NEW_MOON;
            case 1 -> MoonData.MoonPhase.WAXING_CRESCENT;
            case 2 -> MoonData.MoonPhase.FIRST_QUARTER;
            case 3 -> MoonData.MoonPhase.WAXING_GIBBOUS;
            case 4 -> MoonData.MoonPhase.FULL_MOON;
            case 5 -> MoonData.MoonPhase.WANING_GIBBOUS;
            case 6 -> MoonData.MoonPhase.LAST_QUARTER;
            case 7 -> MoonData.MoonPhase.WANING_CRESCENT;
            default -> MoonData.MoonPhase.NEW_MOON;
        };
    }

    // Algorytm aproksymacji fazy księżyca (działa offline)
    private MoonData approximateMoonPhase(LocalDate date) {
        long daysSinceKnownNewMoon = date.toEpochDay() - LocalDate.of(2000, 1, 6).toEpochDay();
        double moonAge = ((daysSinceKnownNewMoon % 29.53) + 29.53) % 29.53;
        double illumination = 50 * (1 - Math.cos(2 * Math.PI * moonAge / 29.53));

        MoonData.MoonPhase phase;
        if (moonAge < 1.85)       phase = MoonData.MoonPhase.NEW_MOON;
        else if (moonAge < 7.38)  phase = MoonData.MoonPhase.WAXING_CRESCENT;
        else if (moonAge < 9.22)  phase = MoonData.MoonPhase.FIRST_QUARTER;
        else if (moonAge < 14.77) phase = MoonData.MoonPhase.WAXING_GIBBOUS;
        else if (moonAge < 16.61) phase = MoonData.MoonPhase.FULL_MOON;
        else if (moonAge < 22.15) phase = MoonData.MoonPhase.WANING_GIBBOUS;
        else if (moonAge < 23.99) phase = MoonData.MoonPhase.LAST_QUARTER;
        else                       phase = MoonData.MoonPhase.WANING_CRESCENT;

        return new MoonData(phase, illumination, moonAge);
    }
}
