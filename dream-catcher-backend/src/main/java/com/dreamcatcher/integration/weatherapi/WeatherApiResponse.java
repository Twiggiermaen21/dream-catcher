package com.dreamcatcher.integration.weatherapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Odpowiedź z WeatherAPI.com — endpoint /forecast.json
 * Jeden call zwraca: pogodę + ciśnienie + fazę księżyca + wschód/zachód słońca.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherApiResponse {

    @JsonProperty("current")
    private Current current;

    @JsonProperty("forecast")
    private Forecast forecast;

    public Current getCurrent()   { return current; }
    public Forecast getForecast() { return forecast; }

    // ── Aktualne warunki ────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Current {

        @JsonProperty("temp_c")
        private double tempC;

        @JsonProperty("pressure_mb")
        private double pressureMb;

        @JsonProperty("humidity")
        private double humidity;

        @JsonProperty("condition")
        private Condition condition;

        public double getTempC()        { return tempC; }
        public double getPressureMb()   { return pressureMb; }
        public double getHumidity()     { return humidity; }
        public Condition getCondition() { return condition; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Condition {

        @JsonProperty("text")
        private String text;

        @JsonProperty("code")
        private int code;

        public String getText() { return text; }
        public int getCode()    { return code; }
    }

    // ── Prognoza (zawiera dane astronomiczne) ───────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Forecast {

        @JsonProperty("forecastday")
        private java.util.List<ForecastDay> forecastDay;

        public ForecastDay getFirstDay() {
            return forecastDay != null && !forecastDay.isEmpty() ? forecastDay.get(0) : null;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ForecastDay {

        @JsonProperty("astro")
        private Astro astro;

        public Astro getAstro() { return astro; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Astro {

        @JsonProperty("sunrise")
        private String sunrise;

        @JsonProperty("sunset")
        private String sunset;

        @JsonProperty("moonrise")
        private String moonrise;

        @JsonProperty("moonset")
        private String moonset;

        @JsonProperty("moon_phase")
        private String moonPhase;          // np. "Full Moon", "Waxing Crescent"

        @JsonProperty("moon_illumination")
        private double moonIllumination;   // 0–100

        public String getSunrise()           { return sunrise; }
        public String getSunset()            { return sunset; }
        public String getMoonrise()          { return moonrise; }
        public String getMoonset()           { return moonset; }
        public String getMoonPhase()         { return moonPhase; }
        public double getMoonIllumination()  { return moonIllumination; }
    }
}
