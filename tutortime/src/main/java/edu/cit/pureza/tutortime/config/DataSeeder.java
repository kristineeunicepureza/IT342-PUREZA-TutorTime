package edu.cit.pureza.tutortime.config;

import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Admin credentials
    private static final String ADMIN_EMAIL    = "admin@tutortime.com";
    private static final String ADMIN_PASSWORD = "Tr0pic@l!Admin#2026Secure";
    private static final String ADMIN_FIRST    = "System";
    private static final String ADMIN_LAST     = "Administrator";

    @Override
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Admin user already exists – skipping seed.");
            return;
        }

        User admin = User.builder()
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .firstName(ADMIN_FIRST)
                .lastName(ADMIN_LAST)
                .middleInitial(null)
                .role(User.UserRole.ADMIN)
                .build();

        userRepository.save(admin);
        log.info("✅  Admin user seeded: {}", ADMIN_EMAIL);
    }
}