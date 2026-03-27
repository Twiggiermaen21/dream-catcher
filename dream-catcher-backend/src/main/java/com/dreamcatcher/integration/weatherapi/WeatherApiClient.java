package com.dreamcatcher.integration.weatherapi;

import com.dreamcatcher.domain.context.MoonData;
import com.dreamcatcher.domain.context.WeatherData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import org.springframework.lang.NonNull;

import java.time.LocalDate;

/**
 * Jeden klient zastępujący wcześniejsze OpenMeteoClient + FarmsenseClient.
 * WeatherAPI.com /forecast.json zwraca w jednym callu:
 *   - temperaturę, ciśnienie, wilgotność, kod pogody
 *   - fazę księżyca, procent oświetlenia
 *   - wschód/zachód słońca i księżyca
 */
@Component
public class WeatherApiClient {

    private static final Logger log = LoggerFactory.getLogger(WeatherApiClient.class);

    private final WebClient webClient;
    private final String apiKey;

    public WeatherApiClient(WebClient.Builder builder,
                            @Value("${external-api.weatherapi.base-url}") @NonNull String baseUrl,
                            @Value("${external-api.weatherapi.api-key}") @NonNull String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    @Cacheable(value = "weatherapi", key = "#date + '_' + #latitude + '_' + #longitude")
    public WeatherApiBundle fetchBundle(LocalDate date, double latitude, double longitude) {
        String location = latitude + "," + longitude;

        log.debug("Calling WeatherAPI for location={}, date={}", location, date);

        WeatherApiResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/forecast.json")
                        .queryParam("key", apiKey)
                        .queryParam("q", location)
                        .queryParam("dt", date.toString())
                        .queryParam("days", 1)
                        .queryParam("aqi", "no")
                        .queryParam("alerts", "no")
                        .build())
                .retrieve()
                .bodyToMono(WeatherApiResponse.class)
                .onErrorResume(ex -> {
                    log.warn("WeatherAPI call failed: {}", ex.getMessage());
                    return reactor.core.publisher.Mono.empty();
                })
                .block();

        if (response == null) {
            log.warn("WeatherAPI returned null — using fallback data");
            return WeatherApiBundle.fallback();
        }

        return mapToBundle(response);
    }

    private WeatherApiBundle mapToBundle(WeatherApiResponse r) {
        WeatherApiResponse.Current current = r.getCurrent();
        WeatherApiResponse.Astro astro = r.getForecast() != null && r.getForecast().getFirstDay() != null
                ? r.getForecast().getFirstDay().getAstro()
                : null;

        WeatherData weatherData = new WeatherData(
                current != null ? current.getTempC()      : 20.0,
                current != null ? current.getPressureMb() : 1013.0,
                current != null ? current.getHumidity()   : 60.0,
                current != null && current.getCondition() != null
                        ? String.valueOf(current.getCondition().getCode())
                        : "unknown"
        );

        MoonData moonData;
        if (astro != null) {
            MoonData.MoonPhase phase = parseMoonPhase(astro.getMoonPhase());
            moonData = new MoonData(phase, astro.getMoonIllumination(), estimateMoonAge(phase));
        } else {
            moonData = new MoonData(MoonData.MoonPhase.NEW_MOON, 0.0, 0.0);
        }

        String sunrise = astro != null ? astro.getSunrise() : "";
        String sunset  = astro != null ? astro.getSunset()  : "";

        return new WeatherApiBundle(weatherData, moonData, sunrise, sunset);
    }

    // WeatherAPI zwraca fazy po angielsku — mapujemy na nasze enum
    private MoonData.MoonPhase parseMoonPhase(String text) {
        if (text == null) return MoonData.MoonPhase.NEW_MOON;
        return switch (text.trim().toLowerCase()) {
            case "new moon"         -> MoonData.MoonPhase.NEW_MOON;
            case "waxing crescent"  -> MoonData.MoonPhase.WAXING_CRESCENT;
            case "first quarter"    -> MoonData.MoonPhase.FIRST_QUARTER;
            case "waxing gibbous"   -> MoonData.MoonPhase.WAXING_GIBBOUS;
            case "full moon"        -> MoonData.MoonPhase.FULL_MOON;
            case "waning gibbous"   -> MoonData.MoonPhase.WANING_GIBBOUS;
            case "last quarter"     -> MoonData.MoonPhase.LAST_QUARTER;
            case "waning crescent"  -> MoonData.MoonPhase.WANING_CRESCENT;
            default -> {
                log.warn("Unknown moon phase from WeatherAPI: '{}'", text);
                yield MoonData.MoonPhase.NEW_MOON;
            }
        };
    }

    private double estimateMoonAge(MoonData.MoonPhase phase) {
        return switch (phase) {
            case NEW_MOON        -> 0.0;
            case WAXING_CRESCENT -> 3.7;
            case FIRST_QUARTER   -> 7.4;
            case WAXING_GIBBOUS  -> 11.1;
            case FULL_MOON       -> 14.8;
            case WANING_GIBBOUS  -> 18.5;
            case LAST_QUARTER    -> 22.1;
            case WANING_CRESCENT -> 25.8;
        };
    }
}
