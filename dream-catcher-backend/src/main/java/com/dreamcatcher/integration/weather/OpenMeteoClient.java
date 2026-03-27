package com.dreamcatcher.integration.weather;

import com.dreamcatcher.domain.context.WeatherData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import org.springframework.lang.NonNull;

import java.time.LocalDate;

@Component
public class OpenMeteoClient {

    private final WebClient webClient;

    public OpenMeteoClient(WebClient.Builder builder,
                           @Value("${external-api.open-meteo.base-url}") @NonNull String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    @Cacheable(value = "weather", key = "#date + '_' + #latitude + '_' + #longitude")
    public WeatherData fetchWeatherData(LocalDate date, double latitude, double longitude) {
        OpenMeteoResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/forecast")
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("daily",
                                "temperature_2m_max",
                                "pressure_msl",
                                "relative_humidity_2m_mean",
                                "weather_code")
                        .queryParam("start_date", date.toString())
                        .queryParam("end_date", date.toString())
                        .queryParam("timezone", "auto")
                        .build())
                .retrieve()
                .bodyToMono(OpenMeteoResponse.class)
                .block();

        if (response == null || response.getDaily() == null) {
            throw new ExternalApiException("Open-Meteo returned empty response for date: " + date);
        }

        OpenMeteoResponse.Daily daily = response.getDaily();
        return new WeatherData(
                daily.getTemperature(),
                daily.getPressureMsl(),
                daily.getRelativeHumidity(),
                daily.getWeatherCode()
        );
    }

    public static class ExternalApiException extends RuntimeException {
        public ExternalApiException(String message) { super(message); }
    }
}
