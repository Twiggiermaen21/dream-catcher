package com.dreamcatcher.api.dto.request;

import com.dreamcatcher.domain.core.DreamLog;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record CreateDreamLogRequest(

        @NotNull
        LocalDate date,

        @NotNull
        @DecimalMin("-90.0") @DecimalMax("90.0")
        Double latitude,

        @NotNull
        @DecimalMin("-180.0") @DecimalMax("180.0")
        Double longitude,

        @NotBlank
        @Size(max = 3000)
        String dreamDescription,

        @NotNull
        DreamLog.DreamClarity clarity,

        @NotNull
        DreamLog.DreamSentiment sentiment,

        List<String> symbols,

        boolean isRecurring
) {}
