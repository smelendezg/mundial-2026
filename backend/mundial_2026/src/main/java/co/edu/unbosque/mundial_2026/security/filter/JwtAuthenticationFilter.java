package co.edu.unbosque.mundial_2026.security.filter;

import java.io.IOException;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;
import co.edu.unbosque.mundial_2026.security.TokenJwt;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

import static co.edu.unbosque.mundial_2026.security.TokenJwt.CONTENT_TYPE;
import static co.edu.unbosque.mundial_2026.security.TokenJwt.HEADER_AUTHORIZATION;
import static co.edu.unbosque.mundial_2026.security.TokenJwt.PREFIX_TOKEN;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private static final int SEGUNDOS_DIA = 86400;

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepo;

    public JwtAuthenticationFilter(final AuthenticationManager authManager,
            final UsuarioRepository usuarioRepo) {
        super(authManager);
        this.authManager = authManager;
        this.usuarioRepo = usuarioRepo;
    }

    @Override
    public Authentication attemptAuthentication(final HttpServletRequest request,
            final HttpServletResponse response) throws AuthenticationException {
        try {
            final Usuario usuario = new ObjectMapper().readValue(request.getInputStream(), Usuario.class);
            return authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            usuario.getCorreoUsuario(),
                            usuario.getContrasena()));
        } catch (IOException e) {
            throw new AuthenticationServiceException("Error al leer las credenciales", e);
        }
    }

    @Override
    protected void successfulAuthentication(final HttpServletRequest request,
            final HttpServletResponse response,
            final FilterChain chain,
            final Authentication authResult) throws IOException, ServletException {

        final String username = authResult.getName();
        final Usuario usuario = usuarioRepo.findByCorreoUsuario(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        final String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();
        final List<GrantedAuthority> roles = (List<GrantedAuthority>) authResult.getAuthorities();

        final String token = Jwts.builder()
                .subject(username)
                .claim("authorities", roles.stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .expiration(Date.from(Instant.now().plusSeconds(SEGUNDOS_DIA)))
                .signWith(TokenJwt.getSecretKey())
                .compact();

        response.addHeader(HEADER_AUTHORIZATION, PREFIX_TOKEN + token);

        final Map<String, String> json = new HashMap<>();
        json.put("token", token);
        json.put("username", username);
        json.put("mensaje", "Hola " + nombreCompleto + " sesión iniciada correctamente");

        response.setContentType(CONTENT_TYPE);
        response.getWriter().write(new ObjectMapper().writeValueAsString(json));
    }

    @Override
    protected void unsuccessfulAuthentication(final HttpServletRequest request,
            final HttpServletResponse response,
            final AuthenticationException failed) throws IOException, ServletException {

        final Map<String, String> json = new HashMap<>();
        json.put("mensaje", "Error en la autenticacion correo/contraseña incorrecto");
        json.put("error", failed.getMessage());

        response.setContentType(CONTENT_TYPE);
        response.setStatus(401);
        response.getWriter().write(new ObjectMapper().writeValueAsString(json));
    }
}