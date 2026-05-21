package co.edu.unbosque.mundial_2026.scheduler;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import co.edu.unbosque.mundial_2026.service.PartidoService;

@Component
public class PartidoScheduler {

    private static final Logger logger = Logger.getLogger(PartidoScheduler.class.getName());
    private static final int LIGA_MUNDIAL = 239;
    private static final int TEMPORADA_MUNDIAL = 2026;

    private final PartidoService partidoService;

    public PartidoScheduler(PartidoService partidoService) {
        this.partidoService = partidoService;
    }

    // cada 5 minutos actualiza resultados de partidos de hoy
    @Scheduled(fixedDelay = 300_000)
    public void actualizarResultadosHoy() {
        final String hoy = LocalDate.now()
                .format(DateTimeFormatter.ISO_LOCAL_DATE);
        try {
            final int actualizados = partidoService
                    .sincronizarPorFechaYLiga(hoy, LIGA_MUNDIAL, TEMPORADA_MUNDIAL);
          logger.log(java.util.logging.Level.INFO, "Partidos actualizados hoy: {0}", actualizados);
        } catch (Exception e) {
            logger.warning("Error actualizando partidos: " + e.getMessage());
        }
    }
}