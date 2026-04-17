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
import co.edu.unbosque.mundial_2026.dto.response.PreferenciaDTO;
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
//Verifica si el correo cambio ya que si si cambio el token se añade a la lista negra para que quede invalido y le indica qe debe iniciar sesion nuevamente con el nuevo correo y credenciales
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
                tokenBlacklist.agregar(header.replace(PREFIX_TOKEN, ""));
            }
            final Map<String, Object> response = new HashMap<>();
            response.put("usuario", resultado.get("usuario"));
            response.put("mensaje", "Correo actualizado, inicia sesión nuevamente");
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.ok(resultado.get("usuario"));
    }
//Cuando cierra sesion añade el token a la lista negra para que nadie mas lo pueda usar
    @PostMapping("/auth/logout")
    public ResponseEntity<Object> logout(final HttpServletRequest request) {
        final String header = request.getHeader(HEADER_AUTHORIZATION);
        if (header != null && header.startsWith(PREFIX_TOKEN)) {
            tokenBlacklist.agregar(header.replace(PREFIX_TOKEN, ""));
        }
        final Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Sesión cerrada correctamente");
        return ResponseEntity.ok(response);
    }



    @GetMapping("/usuarios/seleccionesFavoritas")
    public ResponseEntity<List<PreferenciaDTO>> obtenerSelecciones() {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.seleccionesUsuario(correo));
    }

    @PutMapping("/usuarios/seleccionesFavoritas")
    public ResponseEntity<UsuarioResponseDTO> agregarSeleccion(@RequestBody final List<Long> ids) {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.agregarSeleccion(correo, ids));
    }

    @DeleteMapping("/usuarios/seleccionesFavoritas/{seleccionId}")
    public ResponseEntity<Void> eliminarSeleccion(@PathVariable final Long seleccionId) {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        service.eliminarSeleccion(correo, seleccionId);
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/usuarios/estadiosFav")
    public ResponseEntity<List<PreferenciaDTO>> obtenerEstadios() {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.estadiosUsuario(correo));
    }

    @PutMapping("/usuarios/estadiosFav")
    public ResponseEntity<UsuarioResponseDTO> agregarEstadio(@RequestBody final List<Long> ids) {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.agregarEstadio(correo, ids));
    }

    @DeleteMapping("/usuarios/estadiosFav/{estadioId}")
    public ResponseEntity<Void> eliminarEstadio(@PathVariable final Long estadioId) {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        service.eliminarEstadio(correo, estadioId);
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/usuarios/ciudadesFav")
    public ResponseEntity<List<PreferenciaDTO>> obtenerCiudades() {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.ciudadesUsuario(correo));
    }

    @PutMapping("/usuarios/ciudadesFav")
    public ResponseEntity<UsuarioResponseDTO> agregarCiudad(@RequestBody final List<Long> ids) {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(service.agregarCiudad(correo, ids));
    }

    @DeleteMapping("/usuarios/ciudadesFav/{ciudadId}")
    public ResponseEntity<Void> eliminarCiudad(@PathVariable final Long ciudadId) {
        final String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        service.eliminarCiudad(correo, ciudadId);
        return ResponseEntity.noContent().build();
    }

    // Catálogos generales para selectores del front
    @GetMapping("/estadios")
    public ResponseEntity<List<PreferenciaDTO>> listarEstadios() {
        return ResponseEntity.ok(service.listarEstadios());
    }

    @GetMapping("/ciudades")
    public ResponseEntity<List<PreferenciaDTO>> listarCiudades() {
        return ResponseEntity.ok(service.listarCiudades());
    }
}