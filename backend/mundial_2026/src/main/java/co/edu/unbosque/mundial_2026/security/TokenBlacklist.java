package co.edu.unbosque.mundial_2026.security;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;

@Component
public class TokenBlacklist {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public void agregar(final String token) {
        final long expiracion = Jwts.parser()
                .verifyWith(TokenJwt.getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration()
                .getTime();
        tokens.put(token, expiracion);
    }

    public boolean estaInvalidado(final String token) {
        limpiarExpirados();
        return tokens.containsKey(token);
    }

    private void limpiarExpirados() {
        final long ahora = System.currentTimeMillis();
        tokens.entrySet().removeIf(entry -> entry.getValue() < ahora);
    }
}