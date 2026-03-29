package com.dreamcatcher.integration.aggregator;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.integration.weatherapi.WeatherApiBundle;
import com.dreamcatcher.integration.weatherapi.WeatherApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Jedyny publiczny punkt wejścia do zewnętrznych danych.
 * Używa wyłącznie WeatherAPI.com — jeden call zwraca pogodę + fazę księżyca.
 */
@Service
public class ExternalDataAggregatorService {

    private static final Logger log = LoggerFactory.getLogger(ExternalDataAggregatorService.class);

    private final WeatherApiClient weatherApiClient;

    public ExternalDataAggregatorService(WeatherApiClient weatherApiClient) {
        this.weatherApiClient = weatherApiClient;
    }

    public EnvironmentalContext buildContextFor(LocalDate date, double latitude, double longitude) {
        log.debug("Building context: date={}, lat={}, lon={}", date, latitude, longitude);

        WeatherApiBundle bundle;
        try {
            bundle = weatherApiClient.fetchBundle(date, latitude, longitude);
        } catch (Exception ex) {
            log.warn("WeatherAPI failed, using fallback: {}", ex.getMessage());
            bundle = WeatherApiBundle.fallback();
        }

        return new EnvironmentalContext(bundle.weatherData(), bundle.moonData(), bundle.sunrise(), bundle.sunset());
    }
}
