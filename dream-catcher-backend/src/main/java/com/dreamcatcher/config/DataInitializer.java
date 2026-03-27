package com.dreamcatcher.config;

import com.dreamcatcher.domain.user.Role;
import com.dreamcatcher.domain.user.User;
import com.dreamcatcher.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Tworzy domyślne konta przy pierwszym uruchomieniu, jeśli jeszcze nie istnieją.
 * Hasła pobierane są z zmiennych środowiskowych (.env).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createIfAbsent("admin@dreamcatcher.app",
                System.getenv().getOrDefault("ADMIN_PASSWORD", "Admin1234!"),
                "Administrator", Role.ADMIN);

        createIfAbsent("user@dreamcatcher.app",
                System.getenv().getOrDefault("USER_PASSWORD", "User1234!"),
                "Demo User", Role.USER);
    }

    private void createIfAbsent(String email, String rawPassword, String displayName, Role role) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(new User(email, passwordEncoder.encode(rawPassword), displayName, role));
            log.info("Created default {} account: {}", role, email);
        }
    }
}
