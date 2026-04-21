package co.edu.unbosque.mundial_2026;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {
//Se llaman las variables del env para seguridad
    @Value("${api.football.url}")
    private String apiFootballUrl;

    @Value("${api.football.key}")
    private String apiFootballKey;

    public RestClientConfig() {}
//Inicializa el restcliente con la url base y el header que proporciona Api-Fotball
    @Bean
    public RestClient footballClient() {
        return RestClient.builder()
                .baseUrl(apiFootballUrl)
                .defaultHeader("x-apisports-key", apiFootballKey)
                .build();
    }
}