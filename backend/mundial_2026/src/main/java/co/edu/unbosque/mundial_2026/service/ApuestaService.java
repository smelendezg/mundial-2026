package co.edu.unbosque.mundial_2026.service;

import java.util.List;

import co.edu.unbosque.mundial_2026.dto.ApuestaDTO;
import co.edu.unbosque.mundial_2026.dto.ParticipacionDTO;
import co.edu.unbosque.mundial_2026.dto.PronosticoDTO;
import co.edu.unbosque.mundial_2026.dto.request.ApuestaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO;

public interface ApuestaService {
    ApuestaDTO crearApuesta(ApuestaRequestDTO dto);

    ApuestaDTO unirseApuesta(String codigo, Long usuarioId);

    PronosticoDTO registrarPronostico(PronosticoRequestDTO dto);

    List<ParticipacionDTO> obtenerRanking(Long apuestaId);

    List<PronosticoDTO> calcularPuntos(Long apuestaId);

    ApuestaDTO cerrarApuesta(Long apuestaId);

    ApuestaDTO obtenerApuesta(Long apuestaId);

    List<ApuestaDTO> listarApuestasPorUsuario(Long usuarioId);

    List<ParticipacionDTO> listarParticipantes(Long apuestaId);

    PronosticoDTO verificarPronostico(Long pronosticoId);

    void cerrarApuestasVencidas();

    void calcularPuntosAutomatico();
    List<PronosticoDTO> misPronosticos(Long apuestaId, Long usuarioId);
PronosticoDTO editarPronostico(Long pronosticoId, PronosticoRequestDTO dto);
void eliminarPronostico(Long pronosticoId);
List<PronosticoDTO> calcularPuntosParciales(Long apuestaId);
List<ApuestaDTO> listarTodas();
void eliminarApuesta(Long apuestaId);
}