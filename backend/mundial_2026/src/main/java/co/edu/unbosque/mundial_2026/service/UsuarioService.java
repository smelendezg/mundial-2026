package co.edu.unbosque.mundial_2026.service;

import java.util.List;
import java.util.Map;

import co.edu.unbosque.mundial_2026.dto.request.UsuarioActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.PreferenciaDTO;
import co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO;



public interface UsuarioService {
    List<UsuarioResponseDTO> listarTodos();
    UsuarioResponseDTO registrarUsuario(UsuarioRequestDTO dto);
    UsuarioResponseDTO obtenerUsuario(Long usuarioId);
    UsuarioResponseDTO obtenerPorCorreo(String correo);
    void eliminarUsuario(Long usuarioId);
    Map<String, Object> actualizarPerfil(String correoUsuario, UsuarioActualizarRequestDTO dto);

    // Selecciones favoritas
    List<PreferenciaDTO> seleccionesUsuario(String correo);
    UsuarioResponseDTO agregarSeleccion(String correo, List<Long> idSelecciones);
    void eliminarSeleccion(String correo, Long seleccionId);

    // Estadios favoritos
    List<PreferenciaDTO> estadiosUsuario(String correo);
    UsuarioResponseDTO agregarEstadio(String correo, List<Long> idEstadios);
    void eliminarEstadio(String correo, Long estadioId);

    // Ciudades favoritas
    List<PreferenciaDTO> ciudadesUsuario(String correo);
    UsuarioResponseDTO agregarCiudad(String correo, List<Long> idCiudades);
    void eliminarCiudad(String correo, Long ciudadId);

    // Catálogos generales (para selectores del front)
    List<PreferenciaDTO> listarEstadios();
    List<PreferenciaDTO> listarCiudades();
}