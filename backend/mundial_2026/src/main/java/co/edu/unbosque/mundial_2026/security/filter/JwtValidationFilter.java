package co.edu.unbosque.mundial_2026.security.filter;

import static co.edu.unbosque.mundial_2026.security.TokenJwt.CONTENT_TYPE;
import static co.edu.unbosque.mundial_2026.security.TokenJwt.HEADER_AUTHORIZATION;
import static co.edu.unbosque.mundial_2026.security.TokenJwt.PREFIX_TOKEN;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;



import co.edu.unbosque.mundial_2026.security.TokenBlacklist;
import co.edu.unbosque.mundial_2026.security.TokenJwt;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JwtValidationFilter extends BasicAuthenticationFilter {

    private final TokenBlacklist tokenBlacklist;

    public JwtValidationFilter(final AuthenticationManager authManager,
            final TokenBlacklist tokenBlacklist) {
        super(authManager);
        this.tokenBlacklist = tokenBlacklist;
    }
//Revisa el token del usuario para acceder a funcionalidades del aplicativo
    @Override
    protected void doFilterInternal(final HttpServletRequest request,
            final HttpServletResponse response,
            final FilterChain chain) throws IOException, ServletException {
        try {
            final String header = request.getHeader(HEADER_AUTHORIZATION);

            if (header == null || !header.startsWith(PREFIX_TOKEN)) {
                chain.doFilter(request, response);
                return;
            }

            final String token = header.replace(PREFIX_TOKEN, "");

            if (tokenBlacklist.estaInvalidado(token)) {
                final Map<String, String> body = new HashMap<>();
                body.put("error", "Token invalidado");
                body.put("mensaje", "Sesión cerrada, inicia sesión nuevamente");
                escribirRespuestaError(response, HttpStatus.UNAUTHORIZED.value(), body);
                return;
            }

            final Claims claims = Jwts.parser()
                    .verifyWith(TokenJwt.getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            final String username = claims.getSubject();
            final List<GrantedAuthority> authorities =
                    ((List<?>) claims.get("authorities"))
                            .stream()
                            .map(role -> new SimpleGrantedAuthority(role.toString()))
                            .collect(Collectors.toList());

            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(username, null, authorities));
            chain.doFilter(request, response);

        } catch (JwtException e) {
            final Map<String, String> body = new HashMap<>();
            body.put("error", e.getMessage());
            body.put("mensaje", "El token JWT es inválido");
            escribirRespuestaError(response, HttpStatus.UNAUTHORIZED.value(), body);
        }
    }
//Metodo para asginarle el estado y el mensaje al usuario
    private void escribirRespuestaError(final HttpServletResponse response,
            final int status,
            final Map<String, String> body) throws IOException {
        response.setStatus(status);
        response.setContentType(CONTENT_TYPE);
        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
    }
}