package com.dreamcatcher.service;

import com.dreamcatcher.api.dto.request.CreateDreamLogRequest;
import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.core.DreamLog;
import com.dreamcatcher.integration.aggregator.ExternalDataAggregatorService;
import com.dreamcatcher.repository.DreamLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DreamLogService {

    private final DreamLogRepository repository;
    private final ExternalDataAggregatorService aggregator;

    public DreamLogService(DreamLogRepository repository,
                           ExternalDataAggregatorService aggregator) {
        this.repository = repository;
        this.aggregator = aggregator;
    }

    public DreamLog createDreamLog(UUID userId, CreateDreamLogRequest request) {
        EnvironmentalContext context = aggregator.buildContextFor(
                request.date(),
                request.latitude(),
                request.longitude()
        );

        DreamLog log = new DreamLog(
                userId,
                request.date(),
                context,
                request.dreamDescription(),
                request.clarity(),
                request.sentiment(),
                request.symbols(),
                request.isRecurring()
        );

        return repository.save(log);
    }

    @Transactional(readOnly = true)
    public List<DreamLog> getUserLogs(UUID userId) {
        return repository.findByUserIdOrderByDateDesc(userId);
    }
}
