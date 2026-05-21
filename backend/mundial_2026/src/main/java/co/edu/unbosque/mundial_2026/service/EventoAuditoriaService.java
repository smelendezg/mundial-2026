package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.util.List;

import co.edu.unbosque.mundial_2026.dto.EventoAuditoriaDTO;

public interface EventoAuditoriaService {
    void registrar(String tipo, String descripcion, Long usuarioId, String idCorrelacion, String entidadCorrelacion);
    List<EventoAuditoriaDTO> buscarPorUsuario(Long usuarioId);
    List<EventoAuditoriaDTO> buscarPorTipo(String tipo);
    List<EventoAuditoriaDTO> buscarPorCorrelacion(String correlacion);
    List<EventoAuditoriaDTO> buscarPorEntidad(String entidadCorrelacion);
    List<EventoAuditoriaDTO> buscarPorFecha(LocalDateTime fechaInicio, LocalDateTime fechaFin);
}