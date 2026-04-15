package co.edu.unbosque.mundial_2026.service;

import java.util.List;
import java.util.Map;

import co.edu.unbosque.mundial_2026.dto.request.UsuarioActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO;

public interface UsuarioService {
    List<UsuarioResponseDTO> listarTodos();

    UsuarioResponseDTO registrarUsuario(UsuarioRequestDTO dto);

    UsuarioResponseDTO obtenerUsuario(Long usuarioId);

    UsuarioResponseDTO obtenerPorCorreo(String correo);

    void eliminarUsuario(Long usuarioId);

    Map<String, Object> actualizarPerfil(String correoUsuario, UsuarioActualizarRequestDTO dto);
}