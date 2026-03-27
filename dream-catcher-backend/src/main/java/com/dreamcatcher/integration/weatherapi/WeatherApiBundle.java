package com.dreamcatcher.integration.weatherapi;

import com.dreamcatcher.domain.context.MoonData;
import com.dreamcatcher.domain.context.WeatherData;

/**
 * Wynik jednego calla do WeatherAPI — pogoda + księżyc + wschody słońca.
 * Zastępuje osobne wyniki OpenMeteoResponse + FarmsenseResponse.
 */
public record WeatherApiBundle(
        WeatherData weatherData,
        MoonData moonData,
        String sunrise,
        String sunset
) {
    public static WeatherApiBundle fallback() {
        return new WeatherApiBundle(
                new WeatherData(20.0, 1013.0, 60.0, "unknown"),
                new MoonData(MoonData.MoonPhase.NEW_MOON, 0.0, 0.0),
                "06:00 AM",
                "06:00 PM"
        );
    }
}
