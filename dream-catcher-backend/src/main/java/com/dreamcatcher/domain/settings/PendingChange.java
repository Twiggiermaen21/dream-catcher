package com.dreamcatcher.domain.settings;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pending_changes")
public class PendingChange {

    public enum ChangeType { EMAIL, PASSWORD }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChangeType type;

    // new email OR bcrypt-hashed new password
    @Column(nullable = false, length = 500)
    private String newValue;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    protected PendingChange() {}

    public PendingChange(UUID userId, ChangeType type, String newValue,
                         String token, LocalDateTime expiresAt) {
        this.userId    = userId;
        this.type      = type;
        this.newValue  = newValue;
        this.token     = token;
        this.expiresAt = expiresAt;
    }

    public UUID getId()             { return id; }
    public UUID getUserId()         { return userId; }
    public ChangeType getType()     { return type; }
    public String getNewValue()     { return newValue; }
    public String getToken()        { return token; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}
