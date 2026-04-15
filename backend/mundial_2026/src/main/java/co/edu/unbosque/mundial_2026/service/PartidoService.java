package co.edu.unbosque.mundial_2026.service;

import java.util.List;

import co.edu.unbosque.mundial_2026.dto.response.EquipoConEstadioDTO;
import co.edu.unbosque.mundial_2026.dto.response.JugadorDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PosicionDTO;

public interface PartidoService {
    List<PartidoDTO> obtenerPartidos();

    List<PartidoDTO> obtenerPartidosPorEquipo(Long equipoId);

    PartidoDTO obtenerPartidoPorId(Long fixtureId);

    List<List<PosicionDTO>> obtenerStandings();

    List<EquipoConEstadioDTO> obtenerSelecciones();

    List<JugadorDTO> obtenerJugadoresPorEquipo(Long equipoId);

    List<PartidoDTO> obtenerPartidosPorFecha(String fecha);

    List<PartidoDTO> obtenerPartidosEnVivo();

    int sincronizarPorFechaYLiga(String fecha, int liga, int temporada);

    int actualizarResultado(Long partidoId, int golesLocal, int golesVisitante, int estadoPartido);
}