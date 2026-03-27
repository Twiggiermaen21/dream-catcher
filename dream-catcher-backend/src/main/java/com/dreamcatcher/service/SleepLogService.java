package com.dreamcatcher.service;

import com.dreamcatcher.api.dto.request.CreateSleepLogRequest;
import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.core.SleepLog;
import com.dreamcatcher.integration.aggregator.ExternalDataAggregatorService;
import com.dreamcatcher.repository.SleepLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SleepLogService {

    private final SleepLogRepository repository;
    private final ExternalDataAggregatorService aggregator;

    public SleepLogService(SleepLogRepository repository,
                           ExternalDataAggregatorService aggregator) {
        this.repository = repository;
        this.aggregator = aggregator;
    }

    public SleepLog createSleepLog(UUID userId, CreateSleepLogRequest request) {
        // Pobiera dane środowiskowe automatycznie przy tworzeniu wpisu
        EnvironmentalContext context = aggregator.buildContextFor(
                request.date(),
                request.latitude(),
                request.longitude()
        );

        SleepLog log = new SleepLog(
                userId,
                request.date(),
                context,
                request.bedtime(),
                request.wakeTime(),
                request.sleepQualityRating(),
                request.hadNightmares(),
                request.eveningRituals()
        );

        return repository.save(log);
    }

    @Transactional(readOnly = true)
    public List<SleepLog> getUserLogs(UUID userId) {
        return repository.findByUserIdOrderByDateDesc(userId);
    }
}
