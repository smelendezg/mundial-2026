package co.edu.unbosque.mundial_2026.service;

import java.util.List;

import co.edu.unbosque.mundial_2026.dto.response.EquipoConEstadioDTO;
import co.edu.unbosque.mundial_2026.dto.response.EquipoMundialDTO;
import co.edu.unbosque.mundial_2026.dto.response.JugadorDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PosicionDTO;
import co.edu.unbosque.mundial_2026.dto.response.PreferenciaDTO;
import co.edu.unbosque.mundial_2026.entity.Partido;

public interface PartidoService {
    List<PartidoDTO> obtenerPartidos();

    List<PartidoDTO> obtenerPartidosPorEquipo(Long equipoId);

    PartidoDTO obtenerPartidoPorId(Long fixtureId);

    List<List<PosicionDTO>> obtenerStandings();

    List<EquipoMundialDTO> obtenerSelecciones();

    List<JugadorDTO> obtenerJugadoresPorEquipo(Long equipoId);

    List<PartidoDTO> obtenerPartidosPorFecha(String fecha);

    List<PartidoDTO> obtenerPartidosEnVivo();

    int sincronizarPorFechaYLiga(String fecha, int liga, int temporada);

    int actualizarResultado(Long partidoId, int golesLocal, int golesVisitante, int estadoPartido);
    
    int sincronizarDesdeAPI();

   List<PartidoDTO> obtenerPartidosPorSeleccionesFav(String correo);
List<PartidoDTO> obtenerPartidosPorEstadiosFav(String correo);
List<PartidoDTO> obtenerPartidosPorCiudadesFav(String correo);

    List<Partido> filtrarPorSeleccion(String nombre);
    List<Partido> filtrarPorEstadio(String nombre);
    List<Partido> filtrarPorCiudad(String nombre);
List<PreferenciaDTO> obtenerCatalogoSelecciones();
}