package co.edu.unbosque.mundial_2026.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.mundial_2026.dto.EventoAuditoriaDTO;
import co.edu.unbosque.mundial_2026.service.EventoAuditoriaService;

@RestController
@RequestMapping("/api/auditoria")
public class EventoAuditoriaController {

    private final EventoAuditoriaService eventoService;

    public EventoAuditoriaController(EventoAuditoriaService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<EventoAuditoriaDTO>> buscarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(eventoService.buscarPorUsuario(usuarioId));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<EventoAuditoriaDTO>> buscarPorTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(eventoService.buscarPorTipo(tipo));
    }

    @GetMapping("/correlacion/{correlacion}")
    public ResponseEntity<List<EventoAuditoriaDTO>> buscarPorCorrelacion(@PathVariable String correlacion) {
        return ResponseEntity.ok(eventoService.buscarPorCorrelacion(correlacion));
    }

    @GetMapping("/fecha")
    public ResponseEntity<List<EventoAuditoriaDTO>> buscarPorFecha(
            @RequestParam LocalDateTime fechaInicio,
            @RequestParam LocalDateTime fechaFin) {
        return ResponseEntity.ok(eventoService.buscarPorFecha(fechaInicio, fechaFin));
    }

    @GetMapping("/entidad/{entidad}")
    public ResponseEntity<List<EventoAuditoriaDTO>> buscarPorEntidad(@PathVariable String entidad) {
        return ResponseEntity.ok(eventoService.buscarPorEntidad(entidad));
    }
    @GetMapping("/txs")
public ResponseEntity<List<EventoAuditoriaDTO>> obtenerTxsUsuario(@RequestParam Long userId) {
    return ResponseEntity.ok(eventoService.buscarPorUsuario(userId));
}
}