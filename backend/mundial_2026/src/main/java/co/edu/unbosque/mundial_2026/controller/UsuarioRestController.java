package co.edu.unbosque.mundial_2026.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.mundial_2026.dto.request.UsuarioActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO;
import co.edu.unbosque.mundial_2026.security.TokenBlacklist;
import co.edu.unbosque.mundial_2026.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import static co.edu.unbosque.mundial_2026.security.TokenJwt.HEADER_AUTHORIZATION;
import static co.edu.unbosque.mundial_2026.security.TokenJwt.PREFIX_TOKEN;

@RestController
@RequestMapping("/api")
public class UsuarioRestController {

    private final UsuarioService service;
    private final TokenBlacklist tokenBlacklist;

    public UsuarioRestController(final UsuarioService service,
            final TokenBlacklist tokenBlacklist) {
        this.service = service;
        this.tokenBlacklist = tokenBlacklist;
    }

    @GetMapping("/usuarios/listar")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/usuarios/{idUsuario}")
    public ResponseEntity<UsuarioResponseDTO> obtenerUsuario(@PathVariable final Long idUsuario) {
        return ResponseEntity.ok(service.obtenerUsuario(idUsuario));
    }

    @GetMapping("/usuarios/perfil")
    public ResponseEntity<UsuarioResponseDTO> obtenerPerfil() {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.obtenerPorCorreo(correo));
    }

    @PostMapping("/usuarios/registrar")
    public ResponseEntity<UsuarioResponseDTO> registrarUsuario(
            @Valid @RequestBody final UsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrarUsuario(dto));
    }

    @DeleteMapping("/usuarios/{idUsuario}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable final Long idUsuario) {
        service.eliminarUsuario(idUsuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Object> logout(final HttpServletRequest request) {
        final String header = request.getHeader(HEADER_AUTHORIZATION);
        if (header != null && header.startsWith(PREFIX_TOKEN)) {
            final String token = header.replace(PREFIX_TOKEN, "");
            tokenBlacklist.agregar(token);
        }
        final Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Sesión cerrada correctamente");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/usuarios/perfil")
    public ResponseEntity<Object> actualizarPerfil(
            @Valid @RequestBody final UsuarioActualizarRequestDTO dto,
            final HttpServletRequest request) {

        final String correoUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        final Map<String, Object> resultado = service.actualizarPerfil(correoUsuario, dto);
        final boolean correoCambio = (boolean) resultado.get("correocambio");

        if (correoCambio) {
            final String header = request.getHeader(HEADER_AUTHORIZATION);
            if (header != null && header.startsWith(PREFIX_TOKEN)) {
                final String token = header.replace(PREFIX_TOKEN, "");
                tokenBlacklist.agregar(token);
            }
            final Map<String, Object> response = new HashMap<>();
            response.put("usuario", resultado.get("usuario"));
            response.put("mensaje", "Correo actualizado, inicia sesión nuevamente");
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(resultado.get("usuario"));
    }
}