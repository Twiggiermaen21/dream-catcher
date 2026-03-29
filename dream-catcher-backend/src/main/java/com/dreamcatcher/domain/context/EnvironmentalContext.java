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

    private String sunrise;
    private String sunset;

    protected EnvironmentalContext() {}

    public EnvironmentalContext(WeatherData weatherData, MoonData moonData) {
        this(weatherData, moonData, null, null);
    }

    public EnvironmentalContext(WeatherData weatherData, MoonData moonData, String sunrise, String sunset) {
        this.weatherData = Objects.requireNonNull(weatherData, "weatherData cannot be null");
        this.moonData    = Objects.requireNonNull(moonData,    "moonData cannot be null");
        this.sunrise     = sunrise;
        this.sunset      = sunset;
    }

    public WeatherData getWeatherData() { return weatherData; }
    public MoonData getMoonData()       { return moonData; }
    public String getSunrise()          { return sunrise; }
    public String getSunset()           { return sunset; }

    @Override
    public String toString() {
        return "EnvironmentalContext{weather=%s, moon=%s}".formatted(weatherData, moonData);
    }
}
