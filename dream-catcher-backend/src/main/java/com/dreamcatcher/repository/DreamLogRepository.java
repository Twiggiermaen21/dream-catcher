package com.dreamcatcher.repository;

import com.dreamcatcher.domain.core.DreamLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DreamLogRepository extends JpaRepository<DreamLog, UUID> {

    List<DreamLog> findByUserIdOrderByDateDesc(UUID userId);

    List<DreamLog> findByUserIdAndDateBetweenOrderByDateAsc(UUID userId, LocalDate from, LocalDate to);

    @Query("SELECT d FROM DreamLog d JOIN d.symbols s WHERE d.userId = :userId AND s = :symbol")
    List<DreamLog> findByUserIdAndSymbol(@Param("userId") UUID userId, @Param("symbol") String symbol);

    List<DreamLog> findByUserIdAndIsRecurringTrue(UUID userId);
}
