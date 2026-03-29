package com.dreamcatcher.service;

import com.dreamcatcher.domain.settings.PendingChange;
import com.dreamcatcher.domain.settings.PendingChange.ChangeType;
import com.dreamcatcher.domain.user.Role;
import com.dreamcatcher.domain.user.User;
import com.dreamcatcher.repository.PendingChangeRepository;
import com.dreamcatcher.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PendingChangeRepository pendingChangeRepository;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       PendingChangeRepository pendingChangeRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.pendingChangeRepository = pendingChangeRepository;
        this.emailService = emailService;
    }

    public AuthResponse register(String email, String password, String displayName) {
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        var user = new User(email, passwordEncoder.encode(password), displayName, Role.USER);
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user), user.getId().toString(),
                user.getDisplayName(), user.getRole().name());
    }

    public AuthResponse login(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new AuthResponse(jwtService.generateToken(user), user.getId().toString(),
                user.getDisplayName(), user.getRole().name());
    }

    public void forgotPassword(String email) {
        var found = userRepository.findByEmail(email);
        if (found.isEmpty()) {
            log.warn("[RESET HASŁA] Próba resetu dla nieznanego emaila: {}", email);
            return;
        }
        var user = found.get();
        pendingChangeRepository.deleteByUserIdAndType(user.getId(), ChangeType.PASSWORD_RESET);

        String token = UUID.randomUUID().toString();
        var change = new PendingChange(
                user.getId(),
                ChangeType.PASSWORD_RESET,
                "",
                token,
                LocalDateTime.now().plusMinutes(15)
        );
        pendingChangeRepository.save(change);
        try {
            emailService.sendPasswordResetEmail(email, token);
            log.info("[RESET HASŁA] Email z linkiem wysłany na: {}", email);
        } catch (Exception e) {
            log.error("[RESET HASŁA] Błąd wysyłania emaila na {}: {}", email, e.getMessage());
        }
    }

    public void resetPassword(String token, String newPassword) {
        var change = pendingChangeRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("[RESET HASŁA] Próba użycia nieistniejącego tokena");
                    return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieprawidłowy lub wygasły token");
                });

        if (change.getType() != ChangeType.PASSWORD_RESET) {
            log.warn("[RESET HASŁA] Token ma zły typ: {}", change.getType());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieprawidłowy token");
        }

        if (change.getExpiresAt().isBefore(LocalDateTime.now())) {
            pendingChangeRepository.delete(change);
            log.warn("[RESET HASŁA] Token wygasł dla userId: {}", change.getUserId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token wygasł");
        }

        var user = userRepository.findById(change.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        pendingChangeRepository.delete(change);
        log.info("[RESET HASŁA] Hasło zmienione pomyślnie dla: {}", user.getEmail());
    }

    public record AuthResponse(String token, String userId, String displayName, String role) {}
}
