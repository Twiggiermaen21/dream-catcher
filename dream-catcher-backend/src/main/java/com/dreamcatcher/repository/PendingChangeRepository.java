package com.dreamcatcher.repository;

import com.dreamcatcher.domain.settings.PendingChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PendingChangeRepository extends JpaRepository<PendingChange, UUID> {

    Optional<PendingChange> findByToken(String token);

    @Modifying
    @Query("DELETE FROM PendingChange p WHERE p.userId = :userId AND p.type = :type")
    void deleteByUserIdAndType(UUID userId, PendingChange.ChangeType type);

    @Modifying
    @Query("DELETE FROM PendingChange p WHERE p.expiresAt < :now")
    void deleteAllExpired(@NonNull LocalDateTime now);
}
