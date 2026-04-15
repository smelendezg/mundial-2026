package co.edu.unbosque.mundial_2026;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${api.football.url}")
    private String apiFootballUrl;

    @Value("${api.football.key}")
    private String apiFootballKey;

    public RestClientConfig() {}

    @Bean
    public RestClient footballClient() {
        return RestClient.builder()
                .baseUrl(apiFootballUrl)
                .defaultHeader("x-apisports-key", apiFootballKey)
                .build();
    }
}