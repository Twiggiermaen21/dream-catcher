package com.dreamcatcher.domain.context;

import jakarta.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public final class WeatherData {

    private double temperatureCelsius;
    private double pressureHpa;
    private double humidity;
    private String weatherCode;

    protected WeatherData() {}

    public WeatherData(double temperatureCelsius, double pressureHpa,
                       double humidity, String weatherCode) {
        if (pressureHpa < 800 || pressureHpa > 1100) {
            throw new IllegalArgumentException("Invalid pressure value: " + pressureHpa);
        }
        if (humidity < 0 || humidity > 100) {
            throw new IllegalArgumentException("Humidity must be 0-100: " + humidity);
        }
        this.temperatureCelsius = temperatureCelsius;
        this.pressureHpa = pressureHpa;
        this.humidity = humidity;
        this.weatherCode = Objects.requireNonNull(weatherCode, "weatherCode cannot be null");
    }

    public boolean isLowPressure() {
        return pressureHpa < 1000.0;
    }

    public boolean isHighPressure() {
        return pressureHpa > 1020.0;
    }

    public String getPressureCategory() {
        if (pressureHpa < 990)  return "VERY_LOW";
        if (pressureHpa < 1000) return "LOW";
        if (pressureHpa < 1010) return "NORMAL";
        if (pressureHpa < 1020) return "HIGH";
        return "VERY_HIGH";
    }

    public double getTemperatureCelsius() { return temperatureCelsius; }
    public double getPressureHpa()        { return pressureHpa; }
    public double getHumidity()           { return humidity; }
    public String getWeatherCode()        { return weatherCode; }

    @Override
    public String toString() {
        return "WeatherData{temp=%.1f°C, pressure=%.1fhPa, humidity=%.0f%%, code=%s}"
                .formatted(temperatureCelsius, pressureHpa, humidity, weatherCode);
    }
}
