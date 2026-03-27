package com.dreamcatcher.repository;

import com.dreamcatcher.domain.core.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SleepLogRepository extends JpaRepository<SleepLog, UUID> {

    List<SleepLog> findByUserIdOrderByDateDesc(UUID userId);

    List<SleepLog> findByUserIdAndDateBetweenOrderByDateAsc(UUID userId, LocalDate from, LocalDate to);

    @Query("SELECT s FROM SleepLog s WHERE s.userId = :userId AND s.date >= :from")
    List<SleepLog> findRecentByUserId(@Param("userId") UUID userId, @Param("from") LocalDate from);

    boolean existsByUserIdAndDate(UUID userId, LocalDate date);
}
