package co.edu.unbosque.mundial_2026;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;

import co.edu.unbosque.mundial_2026.security.TokenBlacklist;
import co.edu.unbosque.mundial_2026.security.TokenJwt;
import co.edu.unbosque.mundial_2026.security.filter.JwtValidationFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class SecurityFilterTest {

    @Mock private AuthenticationManager authManager;
    @Mock private TokenBlacklist tokenBlacklist;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain chain;

    private JwtValidationFilter filter;

    @BeforeEach
    void setUp() {
        String secret = "QJoKMMkOnk6M9+f37cAbW4AmU/9DwQUE6pKAQXCkzGA=";
        TokenJwt.init(secret);
        filter = new JwtValidationFilter(authManager, tokenBlacklist);
    }

    @Test
    void doFilterInternal_sinHeader_continuaCadena() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_headerSinBearer_continuaCadena() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic abc123");

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_tokenInvalidado_retornaUnauthorized() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer tokeninvalido");
        when(tokenBlacklist.estaInvalidado("tokeninvalido")).thenReturn(true);
        when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter()));

        filter.doFilter(request, response, chain);

        verify(response).setStatus(401);
        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void doFilterInternal_tokenMalformado_retornaUnauthorized() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer tokenmalformado");
        when(tokenBlacklist.estaInvalidado("tokenmalformado")).thenReturn(false);
        when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter()));

        filter.doFilter(request, response, chain);

        verify(response).setStatus(401);
    }
}