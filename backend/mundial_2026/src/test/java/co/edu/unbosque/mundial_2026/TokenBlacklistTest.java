package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import co.edu.unbosque.mundial_2026.security.TokenBlacklist;
import co.edu.unbosque.mundial_2026.security.TokenJwt;
import io.jsonwebtoken.Jwts;


import java.time.Instant;
import java.util.Date;

public class TokenBlacklistTest {

    private TokenBlacklist tokenBlacklist;
    private String tokenValido;

    @BeforeEach
    void setUp() {
        // Inicializar la clave secreta antes de cada test
        String secret = "QJoKMMkOnk6M9+f37cAbW4AmU/9DwQUE6pKAQXCkzGA=";
        TokenJwt.init(secret);

        tokenBlacklist = new TokenBlacklist();

        // Crear un token válido con expiración a futuro
        tokenValido = Jwts.builder()
                .subject("seb@test.com")
                .expiration(Date.from(Instant.now().plusSeconds(86400)))
                .signWith(TokenJwt.getSecretKey())
                .compact();
    }

    // ── TESTS ─────────────────────────────────────────────────────────────

    @Test
    void tokenNuevo_noEstaInvalidado() {
        // WHEN + THEN
        assertFalse(tokenBlacklist.estaInvalidado(tokenValido));
    }

    @Test
    void agregarToken_tokenQuedaInvalidado() {
        // WHEN
        tokenBlacklist.agregar(tokenValido);

        // THEN
        assertTrue(tokenBlacklist.estaInvalidado(tokenValido));
    }

    @Test
    void agregarToken_otroTokenSigueValido() {
        // GIVEN - crear un segundo token distinto
        String otroToken = Jwts.builder()
                .subject("otro@test.com")
                .expiration(Date.from(Instant.now().plusSeconds(86400)))
                .signWith(TokenJwt.getSecretKey())
                .compact();

        // WHEN - solo invalidar el primero
        tokenBlacklist.agregar(tokenValido);

        // THEN - el segundo sigue válido
        assertFalse(tokenBlacklist.estaInvalidado(otroToken));
    }

    @Test
    void tokenNoAgregado_noEstaInvalidado() {
        // GIVEN - agregar un token
        tokenBlacklist.agregar(tokenValido);

        // WHEN - verificar uno diferente que no se agregó
        String tokenDistinto = Jwts.builder()
                .subject("distinto@test.com")
                .expiration(Date.from(Instant.now().plusSeconds(86400)))
                .signWith(TokenJwt.getSecretKey())
                .compact();

        // THEN
        assertFalse(tokenBlacklist.estaInvalidado(tokenDistinto));
    }
}