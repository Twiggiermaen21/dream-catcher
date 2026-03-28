package com.dreamcatcher.config;

// ═══════════════════════════════════════════════════════════════
// KONFIGURACJA BEZPIECZEŃSTWA — Spring Security
//
// Spring Security to framework obsługujący:
//   - Uwierzytelnianie (Authentication) — kto to jest?
//   - Autoryzację (Authorization) — co może zrobić?
//
// Domyślnie Spring Security blokuje WSZYSTKO.
// Ta klasa konfiguruje co jest dozwolone a co nie.
//
// PRZEPŁYW ŻĄDANIA HTTP w Spring Security:
//   Przeglądarka → [Łańcuch filtrów] → Kontroler
//                   ↑ tu decydujemy co przejdzie
// ═══════════════════════════════════════════════════════════════

import com.dreamcatcher.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// ─────────────────────────────────────────────────────────────
// @Configuration — mówi Springowi: ta klasa zawiera konfigurację.
// Metody z @Bean zwracają obiekty które Spring umieszcza w kontenerze.
//
// @EnableWebSecurity — aktywuje Spring Security dla aplikacji webowej.
// Bez tej adnotacji mechanizmy bezpieczeństwa byłyby wyłączone.
//
// @EnableMethodSecurity — pozwala używać adnotacji bezpieczeństwa
// bezpośrednio na metodach, np.:
//   @PreAuthorize("hasRole('ADMIN')")
//   public void deleteUser(UUID id) { ... }
// ─────────────────────────────────────────────────────────────
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Wstrzykiwane przez konstruktor (constructor injection)
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserRepository userRepository;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserRepository userRepository) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userRepository = userRepository;
    }

    // ─────────────────────────────────────────────────────────
    // @Bean — ta metoda zwraca obiekt który Spring zarządza.
    //
    // SecurityFilterChain — definicja "łańcucha filtrów HTTP".
    // Każde żądanie HTTP przechodzi przez te filtry po kolei.
    //
    // HttpSecurity http — builder do konfiguracji (wzorzec Builder).
    // Każde wywołanie .metodka() zwraca ten sam obiekt — można chainować.
    //
    // throws Exception — konfiguracja może rzucić wyjątek
    // (np. błąd konfiguracji). Metoda deklaruje to w sygnaturze.
    // ─────────────────────────────────────────────────────────
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS — Cross-Origin Resource Sharing.
            // Przeglądarka blokuje żądania z innej domeny (origin).
            // Frontend: http://localhost:5173 → Backend: http://localhost:8080
            // To różne originy! Bez konfiguracji CORS przeglądarka blokuje.
            // corsConfigurationSource() definiuje kto i jak może się łączyć.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // CSRF — Cross-Site Request Forgery (podrabianie żądań).
            // Ochrona przed atakami gdzie złośliwa strona wysyła żądania
            // w imieniu zalogowanego użytkownika.
            //
            // Wyłączamy bo używamy JWT (tokenów) zamiast sesji/ciasteczek.
            // JWT jest przesyłany w nagłówku Authorization — CSRF nie dotyczy.
            .csrf(csrf -> csrf.disable())

            // STATELESS — aplikacja nie przechowuje stanu sesji na serwerze.
            // Każde żądanie musi zawierać JWT token (samo-wystarczalne).
            // To REST-owe podejście — skalowalne, bez problemów z sesją.
            //
            // SessionCreationPolicy.STATELESS = Spring nigdy nie tworzy
            // ani nie używa sesji HTTP.
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // REGUŁY AUTORYZACJI — kto może wywołać które URL.
            // Kolejność MA znaczenie — pierwsze pasujące reguły wygrywa!
            .authorizeHttpRequests(auth -> auth
                // permitAll() — dostępne BEZ logowania (publiczne endpointy)
                .requestMatchers("/api/v1/auth/**").permitAll()    // rejestracja, logowanie
                .requestMatchers("/api/v1/context/**").permitAll() // dane pogody (publiczne)
                .requestMatchers("/actuator/health").permitAll()   // health-check dla monitoringu

                // hasRole("ADMIN") — tylko użytkownicy z rolą ADMIN.
                // Spring automatycznie dodaje prefix "ROLE_" więc
                // hasRole("ADMIN") szuka "ROLE_ADMIN" w authorities.
                .requestMatchers(HttpMethod.GET, "/api/v1/admin/**").hasRole("ADMIN")

                // anyRequest().authenticated() — wszystko inne wymaga zalogowania.
                // Musi być OSTATNIA reguła (catch-all).
                .anyRequest().authenticated()
            )

            // authenticationProvider — mówi Spring Security jak weryfikować hasła.
            // DaoAuthenticationProvider: ładuje usera z bazy i porównuje hasła.
            .authenticationProvider(authenticationProvider())

            // addFilterBefore — dodaj nasz JwtAuthenticationFilter
            // PRZED standardowym filtrem logowania (UsernamePasswordAuthentication).
            // Dzięki temu JWT jest sprawdzany przed każdym żądaniem.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ─────────────────────────────────────────────────────────
    // UserDetailsService — interfejs Spring Security.
    // Jedna metoda: loadUserByUsername(String username) → UserDetails
    //
    // Spring Security używa tego do pobrania danych użytkownika
    // (email, hasło, role) z bazy danych przy logowaniu.
    //
    // LAMBDA — anonimowa funkcja: email -> { ... }
    // Zamiast tworzyć osobną klasę implementującą UserDetailsService,
    // implementujemy jedną metodę interfejsu jako wyrażenie lambda.
    //
    // Składnia lambda: (parametry) -> { ciało }
    //   lub:           (parametr)  -> wyrażenie  (gdy 1 linia)
    // ─────────────────────────────────────────────────────────
    @Bean
    public UserDetailsService userDetailsService() {
        // Szuka użytkownika w bazie po emailu.
        // orElseThrow() — jeśli Optional jest pusty (user nie istnieje),
        // rzuca UsernameNotFoundException → Spring zwraca 401 Unauthorized.
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    // ─────────────────────────────────────────────────────────
    // AuthenticationProvider — obsługuje weryfikację logowania.
    //
    // DaoAuthenticationProvider:
    //   1. Bierze email i hasło z formularza logowania
    //   2. Ładuje usera z bazy (UserDetailsService)
    //   3. Porównuje hasło z bazy z podanym (przez PasswordEncoder)
    //   4. Jeśli OK → tworzy Authentication object
    //
    // var — od Java 10 — kompilator sam wywnioskuje typ.
    //   var provider = new DaoAuthenticationProvider()
    //   jest równoważne:
    //   DaoAuthenticationProvider provider = new DaoAuthenticationProvider()
    // ─────────────────────────────────────────────────────────
    @Bean
    public AuthenticationProvider authenticationProvider() {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ─────────────────────────────────────────────────────────
    // AuthenticationManager — główny obiekt do uwierzytelniania.
    // Używany w AuthService.login() do sprawdzenia email + hasło.
    //
    // AuthenticationConfiguration config — Spring wstrzykuje gotową
    // konfigurację uwierzytelniania. Pobieramy z niej manager.
    // ─────────────────────────────────────────────────────────
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ─────────────────────────────────────────────────────────
    // PasswordEncoder — algorytm szyfrowania haseł.
    //
    // BCrypt — bezpieczny algorytm haszowania haseł (jednokierunkowy).
    //   "haslo123" → "$2a$10$xyz..." (nieodwracalne)
    //
    // Dlaczego nie przechowujemy haseł w postaci jawnej?
    //   - Jeśli baza wycieknie, nikt nie pozna haseł
    //   - BCrypt celowo jest WOLNY (utrudnia brute-force ataki)
    //   - Każdy hash ma losowy "sól" — te same hasła dają różne hashe
    //
    // BCryptPasswordEncoder() — domyślny strength=10 (2^10 iteracji).
    // ─────────────────────────────────────────────────────────
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ─────────────────────────────────────────────────────────
    // CORS Configuration — definiuje kto może wywoływać nasze API.
    //
    // CORS (Cross-Origin Resource Sharing) — mechanizm przeglądarek.
    // Przeglądarka blokuje żądania do innego "origina" (protokół+domena+port).
    //
    // Origin = protokół + domena + port:
    //   http://localhost:5173  ← nasz frontend (Vite dev server)
    //   http://localhost:8080  ← nasz backend (Spring Boot)
    // To RÓŻNE originy → przeglądarka domyślnie blokuje.
    //
    // Ta konfiguracja mówi: "zezwól frontendowi na dostęp do API".
    //
    // CorsConfigurationSource — interfejs Spring, zwraca config dla URL.
    // UrlBasedCorsConfigurationSource — implementacja mapująca URL → config.
    //   "/**" — wildcard, dotyczy wszystkich ścieżek.
    // ─────────────────────────────────────────────────────────
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Tylko te originy mogą wywoływać API
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // Dozwolone metody HTTP
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // OPTIONS — tzw. "preflight request": przeglądarka pyta
        // serwer czy może wysłać żądanie ZANIM je wyśle. Musi być dozwolone.

        // Dozwolone nagłówki ("*" = wszystkie)
        config.setAllowedHeaders(List.of("*"));

        // Pozwól na wysyłanie ciasteczek / nagłówka Authorization
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
