package com.dreamcatcher.service;

import com.dreamcatcher.api.dto.request.CreateDreamLogRequest;
import com.dreamcatcher.domain.context.EnvironmentalContext;
import com.dreamcatcher.domain.core.DreamLog;
import com.dreamcatcher.integration.aggregator.ExternalDataAggregatorService;
import com.dreamcatcher.repository.DreamLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

    public void deleteLog(UUID userId, @NonNull UUID logId) {
        DreamLog log = repository.findById(logId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "DreamLog not found"));
        if (!log.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        repository.delete(log);
    }

    public DreamLog replaceLog(UUID userId, @NonNull UUID logId, CreateDreamLogRequest request) {
        deleteLog(userId, logId);
        return createDreamLog(userId, request);
    }
}
