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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

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
        // Zawsze zwracamy 200 żeby nie ujawniać czy email istnieje w systemie
        userRepository.findByEmail(email).ifPresent(user -> {
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
            emailService.sendPasswordResetEmail(email, token);
        });
    }

    public void resetPassword(String token, String newPassword) {
        var change = pendingChangeRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieprawidłowy lub wygasły token"));

        if (change.getType() != ChangeType.PASSWORD_RESET)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieprawidłowy token");

        if (change.getExpiresAt().isBefore(LocalDateTime.now())) {
            pendingChangeRepository.delete(change);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token wygasł");
        }

        var user = userRepository.findById(change.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        pendingChangeRepository.delete(change);
    }

    public record AuthResponse(String token, String userId, String displayName, String role) {}
}
