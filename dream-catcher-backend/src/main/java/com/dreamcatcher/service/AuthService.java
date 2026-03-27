package com.dreamcatcher.service;

import com.dreamcatcher.domain.user.Role;
import com.dreamcatcher.domain.user.User;
import com.dreamcatcher.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(String email, String password, String displayName) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use: " + email);
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
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthResponse(jwtService.generateToken(user), user.getId().toString(),
                user.getDisplayName(), user.getRole().name());
    }

    public record AuthResponse(String token, String userId, String displayName, String role) {}
}
