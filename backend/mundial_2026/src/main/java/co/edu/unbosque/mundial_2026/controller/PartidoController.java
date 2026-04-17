package co.edu.unbosque.mundial_2026.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.mundial_2026.dto.response.EquipoMundialDTO;
import co.edu.unbosque.mundial_2026.dto.response.JugadorDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PosicionDTO;
import co.edu.unbosque.mundial_2026.dto.response.PreferenciaDTO;
import co.edu.unbosque.mundial_2026.service.PartidoService;

@RestController
@RequestMapping("/api/partidos")
public class PartidoController {

    private final PartidoService partidoService;

    public PartidoController(PartidoService partidoService) {
        this.partidoService = partidoService;
    }

    @GetMapping
    public ResponseEntity<List<PartidoDTO>> listarPartidos() {
        return ResponseEntity.ok(partidoService.obtenerPartidos());
    }

    @GetMapping("/equipo/{equipoId}")
    public ResponseEntity<List<PartidoDTO>> obtenerPartidosPorEquipo(@PathVariable Long equipoId) {
        return ResponseEntity.ok(partidoService.obtenerPartidosPorEquipo(equipoId));
    }

    @GetMapping("/standings")
    public ResponseEntity<List<List<PosicionDTO>>> obtenerStandings() {
        return ResponseEntity.ok(partidoService.obtenerStandings());
    }

    @GetMapping("/selecciones")
    public ResponseEntity<List<EquipoMundialDTO>> obtenerSelecciones() {
        return ResponseEntity.ok(partidoService.obtenerSelecciones());
    }

    @GetMapping("/selecciones/{equipoId}/jugadores")
    public ResponseEntity<List<JugadorDTO>> obtenerJugadoresPorEquipo(@PathVariable Long equipoId) {
        return ResponseEntity.ok(partidoService.obtenerJugadoresPorEquipo(equipoId));
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<PartidoDTO>> obtenerPartidosPorFecha(@PathVariable String fecha) {
        return ResponseEntity.ok(partidoService.obtenerPartidosPorFecha(fecha));
    }

    @GetMapping("/envivo")
    public ResponseEntity<List<PartidoDTO>> obtenerPartidosEnVivo() {
        return ResponseEntity.ok(partidoService.obtenerPartidosEnVivo());
    }

    @GetMapping("/preferencias/selecciones")
    public ResponseEntity<List<PartidoDTO>> obtenerPartidosPorSeleccionesFav() {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(partidoService.obtenerPartidosPorSeleccionesFav(correo));
    }

    @GetMapping("/preferencias/estadios")
    public ResponseEntity<List<PartidoDTO>> obtenerPartidosPorEstadiosFav() {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(partidoService.obtenerPartidosPorEstadiosFav(correo));
    }

    @GetMapping("/preferencias/ciudades")
    public ResponseEntity<List<PartidoDTO>> obtenerPartidosPorCiudadesFav() {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(partidoService.obtenerPartidosPorCiudadesFav(correo));
    }

    @GetMapping("/sincronizar/{liga}/{temporada}/{fecha}")
    public ResponseEntity<Integer> sincronizarPorFechaYLiga(
            @PathVariable int liga,
            @PathVariable int temporada,
            @PathVariable String fecha) {
        return ResponseEntity.ok(partidoService.sincronizarPorFechaYLiga(fecha, liga, temporada));
    }

    @PutMapping("/{id}/resultado/{gol1}/{gol2}/{estado}")
    public ResponseEntity<Integer> actualizarResultado(
            @PathVariable Long id,
            @PathVariable int gol1,
            @PathVariable int gol2,
            @PathVariable int estado) {
        return ResponseEntity.ok(partidoService.actualizarResultado(id, gol1, gol2, estado));
    }

    @GetMapping("/{fixtureId}")
    public ResponseEntity<PartidoDTO> obtenerPorId(@PathVariable Long fixtureId) {
        return ResponseEntity.ok(partidoService.obtenerPartidoPorId(fixtureId));
    }
  @GetMapping("/catalogo/selecciones")
public ResponseEntity<List<PreferenciaDTO>> obtenerCatalogoSelecciones() {
    return ResponseEntity.ok(partidoService.obtenerCatalogoSelecciones());
}
}