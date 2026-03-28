package com.dreamcatcher.config;

// ═══════════════════════════════════════════════════════════════
// FILTR JWT — interceptuje każde żądanie HTTP i sprawdza token.
//
// FILTR (Filter) w Spring = kod wykonywany przed/po każdym żądaniu.
//
// PRZEPŁYW ŻĄDANIA:
//   Klient → [JwtAuthenticationFilter] → [inne filtry] → Kontroler
//
// Ten filtr:
//   1. Odczytuje nagłówek "Authorization: Bearer <token>"
//   2. Wyciąga email i userId z tokena JWT
//   3. Weryfikuje token (czy ważny, czy nie wygasł)
//   4. Jeśli OK: zapisuje w SecurityContext kto jest zalogowany
//   5. Przekazuje żądanie dalej (do kontrolera)
//
// JWT = JSON Web Token — samowystarczalny token (nie trzeba bazy).
//   Format: Header.Payload.Signature (3 części oddzielone kropką)
//   Payload zawiera: email, userId, expiry date, roles...
// ═══════════════════════════════════════════════════════════════

import com.dreamcatcher.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// ─────────────────────────────────────────────────────────────
// @Component — adnotacja Spring.
// Oznacza że ta klasa to komponent zarządzany przez Spring.
// Spring tworzy jeden obiekt tej klasy i zarządza nim.
//
// (vs @Service — semantycznie dla warstwy logiki,
//    @Repository — dla warstwy dostępu do danych,
//    @Component — ogólny komponent, tu: filtr)
//
// OncePerRequestFilter — klasa bazowa Spring.
// Gwarantuje że filtr zostanie wywołany DOKŁADNIE RAZ na żądanie
// (nawet przy forwardach/redirectach wewnątrz aplikacji).
//
// extends — dziedziczenie. JwtAuthenticationFilter rozszerza
// OncePerRequestFilter, dziedzicząc jego zachowanie.
// Musimy nadpisać metodę doFilterInternal().
// ─────────────────────────────────────────────────────────────
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // ─────────────────────────────────────────────────────────
    // @Lazy — opóźnione wstrzyknięcie zależności.
    //
    // Problem (circular dependency / zależność cykliczna):
    //   JwtAuthenticationFilter potrzebuje UserDetailsService
    //   SecurityConfig tworzy UserDetailsService
    //   SecurityConfig potrzebuje JwtAuthenticationFilter
    //   → Kółko! Spring nie wie co stworzyć pierwsze.
    //
    // Rozwiązanie: @Lazy
    //   Mówi Springowi: "nie twórz UserDetailsService teraz —
    //   stwórz go dopiero gdy faktycznie będzie potrzebny".
    //   Spring tworzy PROXY obiektu, a prawdziwy obiekt powstaje
    //   przy pierwszym wywołaniu metody.
    //
    // @Lazy jest TYLKO na UserDetailsService bo to on zamyka pętlę.
    // ─────────────────────────────────────────────────────────
    public JwtAuthenticationFilter(JwtService jwtService, @Lazy UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // ─────────────────────────────────────────────────────────
    // @Override — nadpisujemy metodę abstrakcyjną z klasy bazowej.
    //
    // SYGNATURA METODY:
    //   protected void doFilterInternal(request, response, filterChain)
    //     throws ServletException, IOException
    //
    // PARAMETRY:
    //   HttpServletRequest request   — obiekt żądania HTTP
    //     (nagłówki, body, atrybuty, URL, metoda GET/POST...)
    //   HttpServletResponse response — obiekt odpowiedzi HTTP
    //     (możemy ustawiać statusy, nagłówki odpowiedzi)
    //   FilterChain filterChain      — reszta łańcucha filtrów
    //     (musimy wywołać filterChain.doFilter() żeby żądanie
    //     trafiło do następnego filtra/kontrolera)
    //
    // throws — deklaracja wyjątków checked (sprawdzanych przez kompilator).
    //   Metoda musi albo obsłużyć te wyjątki (try-catch)
    //   albo je zadeklarować (throws).
    //   ServletException, IOException — standardowe wyjątki webowe.
    //
    // @NonNull — adnotacja informacyjna (nie robi nic w runtime).
    //   Mówi programistom: "ten parametr nie może być null".
    //   Narzędzia (IntelliJ, checkstyle) mogą ostrzegać jeśli
    //   spróbujesz przekazać null.
    // ─────────────────────────────────────────────────────────
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Krok 1: Odczytaj nagłówek "Authorization" z żądania.
        //
        // Nagłówki HTTP = metadane żądania (nie są widoczne w URL).
        // Nagłówek Authorization w formacie: "Bearer eyJhbGciOi..."
        //   "Bearer" — typ tokenu (schemat uwierzytelniania)
        //   reszta   — sam token JWT
        //
        // final — zmienna lokalna nie będzie ponownie przypisana.
        //   Dobra praktyka: używaj final wszędzie gdzie możesz.
        final String authHeader = request.getHeader("Authorization");

        // Krok 2: Jeśli nie ma tokenu, pomiń filtr.
        //
        // || — operator logiczny "LUB" (OR). Zwraca true jeśli
        //      przynajmniej jeden warunek jest prawdziwy.
        //
        // startsWith("Bearer ") — sprawdza czy nagłówek zaczyna się
        // od "Bearer " (ze spacją). Jeśli nie → brak tokenu JWT.
        //
        // filterChain.doFilter(request, response) — przekaż żądanie
        // dalej w łańcuchu. Bez tego żądanie "utknęłoby" w filtrze.
        //
        // return — wyjdź z metody (nie wykonuj reszty kodu).
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Krok 3: Wyciągnij token i email z nagłówka.
        //
        // substring(7) — pomija pierwsze 7 znaków ("Bearer ").
        //   "Bearer eyJhbGci..." → "eyJhbGci..."
        //   Indeksowanie od 0: B=0, e=1, a=2, r=3, e=4, r=5, " "=6, e=7...
        //
        // jwtService.extractEmail(jwt) — dekoduje token JWT i zwraca email.
        // JWT zawiera "claims" (dane) w środkowej części (Payload).
        final String jwt = authHeader.substring(7);
        final String email = jwtService.extractEmail(jwt);

        // Krok 4: Walidacja i ustawienie kontekstu bezpieczeństwa.
        //
        // email != null — token zawierał email
        // SecurityContextHolder.getContext().getAuthentication() == null
        //   — użytkownik NIE jest jeszcze uwierzytelniony w bieżącym żądaniu
        //   (zapobiega podwójnemu uwierzytelnianiu)
        //
        // && — operator logiczny "I" (AND). Oba warunki muszą być true.
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Załaduj szczegóły użytkownika z bazy danych.
            // loadUserByUsername pobiera: email, hasło (hash), role.
            var userDetails = userDetailsService.loadUserByUsername(email);

            // Sprawdź czy token jest ważny (podpis OK i nie wygasł).
            if (jwtService.isTokenValid(jwt, email)) {

                // Utwórz obiekt Authentication (Spring Security).
                // UsernamePasswordAuthenticationToken = standardowy typ.
                //   parametr 1: principal (kto?) — UserDetails
                //   parametr 2: credentials (hasło?) — null (JWT = brak hasła)
                //   parametr 3: authorities (role) — lista uprawnień
                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                // Dodaj szczegóły żądania (IP, session id...) do tokena.
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Zapisz Authentication w SecurityContext.
                // SecurityContext = "skrzynka" przechowująca info o zalogowanym.
                // Dostępna wszędzie w tym wątku (ThreadLocal).
                // Kontrolery mogą teraz sprawdzać @PreAuthorize, hasRole() itp.
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Zapisz userId jako atrybut żądania.
                // Dzięki temu kontrolery mogą odczytać go przez:
                //   @RequestAttribute("userId") UUID userId
                //
                // To bezpieczniejsze niż nagłówek HTTP:
                //   - Atrybuty są wewnętrzne (klient nie może ich podrobić)
                //   - Nagłówki HTTP może wysłać ktokolwiek
                // UUID.fromString() — konwertuje String na UUID.
                // @RequestAttribute("userId") w kontrolerach oczekuje UUID,
                // a nie String — Spring nie robi tej konwersji automatycznie.
                request.setAttribute("userId",
                        java.util.UUID.fromString(jwtService.extractUserId(jwt)));
            }
        }

        // Krok 5: Przekaż żądanie dalej do następnego filtra lub kontrolera.
        // Ten krok ZAWSZE musi nastąpić (stąd jest poza blokiem if).
        filterChain.doFilter(request, response);
    }
}
