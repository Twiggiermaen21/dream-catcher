package com.dreamcatcher.service;

import com.dreamcatcher.api.dto.request.RequestEmailChangeRequest;
import com.dreamcatcher.api.dto.request.RequestPasswordChangeRequest;
import com.dreamcatcher.domain.settings.PendingChange;
import com.dreamcatcher.domain.settings.PendingChange.ChangeType;
import com.dreamcatcher.repository.PendingChangeRepository;
import com.dreamcatcher.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
public class SettingsService {

    private final UserRepository userRepository;
    private final PendingChangeRepository pendingChangeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public SettingsService(UserRepository userRepository,
                           PendingChangeRepository pendingChangeRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService) {
        this.userRepository          = userRepository;
        this.pendingChangeRepository = pendingChangeRepository;
        this.passwordEncoder         = passwordEncoder;
        this.emailService            = emailService;
    }

    public void requestEmailChange(@NonNull UUID userId, RequestEmailChangeRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (userRepository.existsByEmail(request.newEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");

        // Remove any existing pending email change for this user
        pendingChangeRepository.deleteByUserIdAndType(userId, ChangeType.EMAIL);

        String token = UUID.randomUUID().toString();
        var change = new PendingChange(
                userId,
                ChangeType.EMAIL,
                request.newEmail(),
                token,
                LocalDateTime.now().plusMinutes(5)
        );
        pendingChangeRepository.save(change);

        emailService.sendEmailChangeConfirmation(user.getEmail(), token);
    }

    public void requestPasswordChange(@NonNull UUID userId, RequestPasswordChangeRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");

        // Remove any existing pending password change for this user
        pendingChangeRepository.deleteByUserIdAndType(userId, ChangeType.PASSWORD);

        String token = UUID.randomUUID().toString();
        String hashedNewPassword = passwordEncoder.encode(request.newPassword());

        var change = new PendingChange(
                userId,
                ChangeType.PASSWORD,
                hashedNewPassword,
                token,
                LocalDateTime.now().plusMinutes(5)
        );
        pendingChangeRepository.save(change);

        emailService.sendPasswordChangeConfirmation(user.getEmail(), token);
    }

    // Returns the frontend redirect URL after confirmation
    public String confirmChange(String token) {
        var change = pendingChangeRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid token"));

        if (change.getExpiresAt().isBefore(LocalDateTime.now())) {
            pendingChangeRepository.delete(change);
            return frontendUrl + "/settings?error=expired";
        }

        var user = userRepository.findById(Objects.requireNonNull(change.getUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        switch (change.getType()) {
            case EMAIL    -> user.setEmail(change.getNewValue());
            case PASSWORD -> user.setPassword(change.getNewValue());
        }

        userRepository.save(Objects.requireNonNull(user));
        pendingChangeRepository.delete(change);

        String changedParam = change.getType() == ChangeType.EMAIL ? "email" : "password";
        return frontendUrl + "/settings?changed=" + changedParam;
    }
}
