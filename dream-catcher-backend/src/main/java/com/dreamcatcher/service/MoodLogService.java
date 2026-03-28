package com.dreamcatcher.service;

import com.dreamcatcher.api.dto.request.CreateMoodLogRequest;
import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.core.MoodLog;
import com.dreamcatcher.integration.aggregator.ExternalDataAggregatorService;
import com.dreamcatcher.repository.MoodLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MoodLogService {

    private final MoodLogRepository repository;
    private final ExternalDataAggregatorService aggregator;

    public MoodLogService(MoodLogRepository repository,
                          ExternalDataAggregatorService aggregator) {
        this.repository = repository;
        this.aggregator = aggregator;
    }

    public MoodLog createMoodLog(UUID userId, CreateMoodLogRequest request) {
        EnvironmentalContext context = aggregator.buildContextFor(
                request.date(),
                request.latitude(),
                request.longitude()
        );

        MoodLog log = new MoodLog(
                userId,
                request.date(),
                context,
                request.morningMood(),
                request.eveningMood(),
                request.energyLevel(),
                request.stressLevel(),
                request.notes()
        );

        return repository.save(log);
    }

    @Transactional(readOnly = true)
    public List<MoodLog> getUserLogs(UUID userId) {
        return repository.findByUserIdOrderByDateDesc(userId);
    }
}
