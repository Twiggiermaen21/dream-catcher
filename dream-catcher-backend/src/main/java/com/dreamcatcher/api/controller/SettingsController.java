package com.dreamcatcher.api.controller;

import com.dreamcatcher.api.dto.request.RequestEmailChangeRequest;
import com.dreamcatcher.api.dto.request.RequestPasswordChangeRequest;
import com.dreamcatcher.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @PostMapping("/request-email-change")
    public ResponseEntity<Void> requestEmailChange(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody RequestEmailChangeRequest request) {
        settingsService.requestEmailChange(userId, request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/request-password-change")
    public ResponseEntity<Void> requestPasswordChange(
            @RequestAttribute("userId") UUID userId,
            @Valid @RequestBody RequestPasswordChangeRequest request) {
        settingsService.requestPasswordChange(userId, request);
        return ResponseEntity.accepted().build();
    }

    // Public — user clicks a link in email, no JWT present
    @GetMapping("/confirm")
    public ResponseEntity<Void> confirm(@RequestParam String token) {
        String redirectUrl = settingsService.confirmChange(token);
        return ResponseEntity.status(302)
                .location(java.util.Objects.requireNonNull(URI.create(redirectUrl)))
                .build();
    }
}
