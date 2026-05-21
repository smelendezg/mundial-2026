package co.edu.unbosque.mundial_2026.security;

import java.util.Base64;

import javax.crypto.SecretKey;

import io.jsonwebtoken.security.Keys;

public final class TokenJwt {

    public static final String PREFIX_TOKEN = "Bearer ";
    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String CONTENT_TYPE = "application/json";

    private static SecretKey secretKey;

    private TokenJwt() {}

    public static void init(final String secret) {
        final byte[] keyBytes = Base64.getDecoder().decode(secret);
        secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public static SecretKey getSecretKey() {
        return secretKey;
    }
}