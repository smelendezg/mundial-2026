package co.edu.unbosque.mundial_2026.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;
import co.edu.unbosque.mundial_2026.security.filter.JwtAuthenticationFilter;
import co.edu.unbosque.mundial_2026.security.filter.JwtValidationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final AuthenticationConfiguration authConfig;
    private final UsuarioRepository usuarioRepository;
    private final TokenBlacklist tokenBlacklist;
    private static final String API_ENTRADAS = "/api/entradas/**";
private static final String API_PAYMENTS = "/payments/**";//FALTA REVISAR BIEN LAS URLS PERMITIDAS

    public SecurityConfig(AuthenticationConfiguration authConfig,
            UsuarioRepository usuarioRepository,
            TokenBlacklist tokenBlacklist) {
        this.authConfig = authConfig;
        this.usuarioRepository = usuarioRepository;
        this.tokenBlacklist = tokenBlacklist;
    }
//Se crean los beans para poder usarlos segun corresponda en las demas clases
    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner initJwtKey() {
        return args -> TokenJwt.init(jwtSecret);
    }
//Relaciona las rutas a las que pueden acceder los usuarios segun su rol y las que necesita estar autenticado o no
//FALTA REVISAR BIEN LAS URL PERMITIDAS
    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http,
            final AuthenticationManager authManager) throws Exception {
        return http.authorizeHttpRequests(authz -> authz
        .requestMatchers(HttpMethod.GET, "/api/usuarios/listar").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/usuarios/registrar").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
        .requestMatchers(HttpMethod.POST, API_ENTRADAS).authenticated()
.requestMatchers(HttpMethod.GET, API_ENTRADAS).authenticated()
.requestMatchers(HttpMethod.PATCH, API_ENTRADAS).authenticated()
.requestMatchers(HttpMethod.GET, API_PAYMENTS).authenticated()
.requestMatchers(HttpMethod.POST, API_PAYMENTS).authenticated()
.requestMatchers(HttpMethod.PATCH, API_PAYMENTS).authenticated()
        
        .requestMatchers(HttpMethod.GET, "/api/auditoria/**").authenticated()
        .anyRequest().authenticated())
                .addFilter(new JwtAuthenticationFilter(authManager, usuarioRepository))
                .addFilter(new JwtValidationFilter(authManager, tokenBlacklist))
                .csrf(config -> config.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(management -> management
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:4200",
    "http://localhost:8080",
    "http://localhost:5173"
));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "DELETE", "PUT", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        final FilterRegistrationBean<CorsFilter> corsBean = new FilterRegistrationBean<>(
                new CorsFilter(corsConfigurationSource()));
        corsBean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return corsBean;
    }
}