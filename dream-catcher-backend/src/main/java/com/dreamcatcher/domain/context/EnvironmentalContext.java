package com.dreamcatcher.domain.context;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import java.util.Objects;

@Embeddable
public final class EnvironmentalContext {

    @Embedded
    private WeatherData weatherData;

    @Embedded
    private MoonData moonData;

    protected EnvironmentalContext() {}

    public EnvironmentalContext(WeatherData weatherData, MoonData moonData) {
        this.weatherData = Objects.requireNonNull(weatherData, "weatherData cannot be null");
        this.moonData    = Objects.requireNonNull(moonData,    "moonData cannot be null");
    }

    public WeatherData getWeatherData() { return weatherData; }
    public MoonData getMoonData()       { return moonData; }

    @Override
    public String toString() {
        return "EnvironmentalContext{weather=%s, moon=%s}".formatted(weatherData, moonData);
    }
}
