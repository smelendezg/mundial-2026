package co.edu.unbosque.mundial_2026.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.mundial_2026.dto.NotificacionDTO;
import co.edu.unbosque.mundial_2026.dto.request.NotificacionMasivaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.NotificacionRequestDTO;
import co.edu.unbosque.mundial_2026.service.NotificacionService;
import co.edu.unbosque.mundial_2026.service.UsuarioService;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final UsuarioService usuarioService;

    public NotificacionController(NotificacionService notificacionService,
            UsuarioService usuarioService) {
        this.notificacionService = notificacionService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<NotificacionDTO>> listarMisNotificaciones() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Long usuarioId = usuarioService.obtenerPorCorreo(correo).getId();
        return ResponseEntity.ok(notificacionService.listarPorUsuario(usuarioId));
    }

    @PutMapping("/{id}/leida")
    public ResponseEntity<Void> marcarLeida(@PathVariable Long id) {
        notificacionService.marcarLeida(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/leidas")
    public ResponseEntity<Void> marcarTodasLeidas() {
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Long usuarioId = usuarioService.obtenerPorCorreo(correo).getId();
        notificacionService.marcarTodasLeidas(usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/enviar")
    public ResponseEntity<Void> enviarIndividual(@RequestBody NotificacionRequestDTO dto) {
        notificacionService.enviarNotificacion(dto);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/masiva")
    public ResponseEntity<Void> enviarMasiva(@RequestBody NotificacionMasivaRequestDTO dto) {
        notificacionService.enviarMasiva(dto);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/partido/{partidoId}")
    public ResponseEntity<Void> notificarPorPartido(
            @PathVariable Long partidoId,
            @RequestBody NotificacionRequestDTO dto) {
        notificacionService.notificarPorPartido(
                partidoId, dto.getTipo(), dto.getTitulo(), dto.getMensaje());
        return ResponseEntity.noContent().build();
    }
}