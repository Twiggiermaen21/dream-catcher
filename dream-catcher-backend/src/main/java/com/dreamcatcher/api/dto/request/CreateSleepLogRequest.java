package com.dreamcatcher.api.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record CreateSleepLogRequest(

        @NotNull
        LocalDate date,

        @NotNull
        @DecimalMin("-90.0") @DecimalMax("90.0")
        Double latitude,

        @NotNull
        @DecimalMin("-180.0") @DecimalMax("180.0")
        Double longitude,

        @NotNull
        LocalTime bedtime,

        @NotNull
        LocalTime wakeTime,

        @Min(1) @Max(10)
        int sleepQualityRating,

        boolean hadNightmares,

        List<String> eveningRituals
) {}
