package com.dreamcatcher.integration.weather;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenMeteoResponse {

    @JsonProperty("daily")
    private Daily daily;

    public Daily getDaily() { return daily; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Daily {

        @JsonProperty("temperature_2m_max")
        private List<Double> temperature;

        @JsonProperty("pressure_msl")
        private List<Double> pressureMsl;

        @JsonProperty("relative_humidity_2m_mean")
        private List<Double> relativeHumidity;

        @JsonProperty("weather_code")
        private List<Integer> weatherCode;

        // Pobiera wartość dla pierwszego (jedynego) dnia w odpowiedzi
        public double getTemperature()      { return temperature != null && !temperature.isEmpty() ? temperature.get(0) : 0; }
        public double getPressureMsl()      { return pressureMsl != null && !pressureMsl.isEmpty() ? pressureMsl.get(0) : 1013; }
        public double getRelativeHumidity() { return relativeHumidity != null && !relativeHumidity.isEmpty() ? relativeHumidity.get(0) : 50; }
        public String getWeatherCode()      { return weatherCode != null && !weatherCode.isEmpty() ? String.valueOf(weatherCode.get(0)) : "0"; }
    }
}
