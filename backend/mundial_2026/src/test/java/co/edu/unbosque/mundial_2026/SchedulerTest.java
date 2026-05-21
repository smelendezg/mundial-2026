package co.edu.unbosque.mundial_2026;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import co.edu.unbosque.mundial_2026.repository.ApuestaRepository;
import co.edu.unbosque.mundial_2026.scheduler.ApuestaScheduler;
import co.edu.unbosque.mundial_2026.scheduler.PartidoScheduler;
import co.edu.unbosque.mundial_2026.service.ApuestaService;
import co.edu.unbosque.mundial_2026.service.PartidoService;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class SchedulerTest {

    @Mock private ApuestaService apuestaService;
    @Mock private ApuestaRepository apuestaRepository;
    @InjectMocks private ApuestaScheduler apuestaScheduler;

    @Mock private PartidoService partidoService;
    @InjectMocks private PartidoScheduler partidoScheduler;

    @Test
    void cerrarPollasvencidas_ejecutaCorrectamente() {
        doNothing().when(apuestaService).cerrarApuestasVencidas();
        apuestaScheduler.cerrarPollasvencidas();
        verify(apuestaService).cerrarApuestasVencidas();
    }

    @Test
    void calcularParciales_ejecutaCorrectamente() {
        when(apuestaRepository.findByEstado("ABIERTA")).thenReturn(List.of());
        apuestaScheduler.calcularParciales();
        verify(apuestaRepository).findByEstado("ABIERTA");
    }

    @Test
    void calcularFinales_ejecutaCorrectamente() {
        doNothing().when(apuestaService).calcularPuntosAutomatico();
        apuestaScheduler.calcularFinales();
        verify(apuestaService).calcularPuntosAutomatico();
    }

    @Test
    void actualizarResultadosHoy_ejecutaCorrectamente() {
        when(partidoService.sincronizarPorFechaYLiga(any(), anyInt(), anyInt())).thenReturn(0);
        partidoScheduler.actualizarResultadosHoy();
        verify(partidoService).sincronizarPorFechaYLiga(any(), anyInt(), anyInt());
    }
}