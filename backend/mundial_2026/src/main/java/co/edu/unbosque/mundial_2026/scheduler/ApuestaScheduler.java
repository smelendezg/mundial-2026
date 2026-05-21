package co.edu.unbosque.mundial_2026.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import co.edu.unbosque.mundial_2026.repository.ApuestaRepository;
import co.edu.unbosque.mundial_2026.service.ApuestaService;

@Component
public class ApuestaScheduler {

    private final ApuestaService apuestaService;
    private final ApuestaRepository apuestaRepository;

    public ApuestaScheduler(ApuestaService apuestaService, ApuestaRepository apuestaRepository) {
        this.apuestaService = apuestaService;
        this.apuestaRepository = apuestaRepository;
    }

    // cada 5 minutos cierra pollas vencidas
    @Scheduled(fixedDelay = 300_000)
    public void cerrarPollasvencidas() {
        apuestaService.cerrarApuestasVencidas();
    }

    // cada 10 minutos calcula puntos parciales de pollas abiertas
    @Scheduled(fixedDelay = 600_000)
    public void calcularParciales() {
        apuestaRepository.findByEstado("ABIERTA")
                .forEach(a -> apuestaService.calcularPuntosParciales(a.getId()));
    }

    // cada 10 minutos calcula puntos finales de pollas cerradas
    @Scheduled(fixedDelay = 600_000)
    public void calcularFinales() {
        apuestaService.calcularPuntosAutomatico();
    }
}