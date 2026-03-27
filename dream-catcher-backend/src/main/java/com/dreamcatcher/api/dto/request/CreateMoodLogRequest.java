package com.dreamcatcher.api.dto.request;

import com.dreamcatcher.domain.core.MoodLog;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateMoodLogRequest(

        @NotNull
        LocalDate date,

        @NotNull
        @DecimalMin("-90.0") @DecimalMax("90.0")
        Double latitude,

        @NotNull
        @DecimalMin("-180.0") @DecimalMax("180.0")
        Double longitude,

        @NotNull
        MoodLog.MoodType morningMood,

        @NotNull
        MoodLog.MoodType eveningMood,

        @Min(1) @Max(10)
        int energyLevel,

        @Min(1) @Max(10)
        int stressLevel,

        @Size(max = 1000)
        String notes
) {}
