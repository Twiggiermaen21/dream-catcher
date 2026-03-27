package com.dreamcatcher.repository;

import com.dreamcatcher.domain.core.MoodLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MoodLogRepository extends JpaRepository<MoodLog, UUID> {

    List<MoodLog> findByUserIdOrderByDateDesc(UUID userId);

    List<MoodLog> findByUserIdAndDateBetweenOrderByDateAsc(UUID userId, LocalDate from, LocalDate to);
}
