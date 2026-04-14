package co.edu.unbosque.mundial_2026.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unbosque.mundial_2026.dto.request.UsuarioActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Rol;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.ContrasenaIncorrectaException;
import co.edu.unbosque.mundial_2026.exception.CorreoEnUsoException;
import co.edu.unbosque.mundial_2026.exception.RolNotFoundException;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.RolRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado";

    private final UsuarioRepository repository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository repository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public UsuarioResponseDTO registrarUsuario(final UsuarioRequestDTO dto) {
        if (repository.findByCorreoUsuario(dto.getCorreoUsuario()).isPresent()) {
            throw new CorreoEnUsoException("El correo ya está en uso: " + dto.getCorreoUsuario());
        }

        final String nombreRol = determinarRol(dto.getRol());
        final Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RolNotFoundException("Rol no encontrado: " + nombreRol));

        final Usuario usuario = new Usuario();
        usuario.setCorreoUsuario(dto.getCorreoUsuario());
        usuario.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        usuario.setRol(rol);
        usuario.setNombre(dto.getNombre());
        usuario.setApellido(dto.getApellido());

        return toResponseDTO(repository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerUsuario(final Long usuarioId) {
        return toResponseDTO(repository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO)));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorCorreo(final String correo) {
        return toResponseDTO(repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO)));
    }

    @Override
    @Transactional
    public void eliminarUsuario(final Long usuarioId) {
        final Usuario usuario = repository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        usuario.setActivo(false);
        repository.save(usuario);
    }

    @Override
    @Transactional
    public Map<String, Object> actualizarPerfil(final String correoUsuario,
            final UsuarioActualizarRequestDTO dto) {
        final Usuario usuario = repository.findByCorreoUsuario(correoUsuario)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));

        final String contrasenaOrig = usuario.getContrasena();

        actualizarNombre(usuario, dto);
        actualizarApellido(usuario, dto);
        actualizarContrasena(usuario, dto, contrasenaOrig);

        final boolean correoCambio = actualizarCorreo(usuario, dto, contrasenaOrig);
        final Usuario usuarioGuardado = repository.save(usuario);

        final Map<String, Object> resultado = new HashMap<>();
        resultado.put("usuario", toResponseDTO(usuarioGuardado));
        resultado.put("correocambio", correoCambio);
        return resultado;
    }

    private void actualizarNombre(final Usuario usuario, final UsuarioActualizarRequestDTO dto) {
        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            usuario.setNombre(dto.getNombre());
        }
    }

    private void actualizarApellido(final Usuario usuario, final UsuarioActualizarRequestDTO dto) {
        if (dto.getApellido() != null && !dto.getApellido().isBlank()) {
            usuario.setApellido(dto.getApellido());
        }
    }

    private void actualizarContrasena(final Usuario usuario, final UsuarioActualizarRequestDTO dto,
            final String contrasenaOrig) {
        if (dto.getContrasenaNueva() != null && !dto.getContrasenaNueva().isBlank()) {
            validarContrasenaActual(dto.getContrasenaActual(), contrasenaOrig);
            usuario.setContrasena(passwordEncoder.encode(dto.getContrasenaNueva()));
        }
    }

    private boolean actualizarCorreo(final Usuario usuario, final UsuarioActualizarRequestDTO dto,
            final String contrasenaOrig) {
        boolean correoCambio = false;
        if (dto.getCorreoNuevo() != null && !dto.getCorreoNuevo().isBlank()) {
            validarContrasenaActual(dto.getContrasenaActual(), contrasenaOrig);
            if (repository.findByCorreoUsuario(dto.getCorreoNuevo()).isPresent()) {
                throw new CorreoEnUsoException("El correo ya está en uso");
            }
            usuario.setCorreoUsuario(dto.getCorreoNuevo());
            correoCambio = true;
        }
        return correoCambio;
    }

    private void validarContrasenaActual(final String contrasenaActual, final String contrasenaOrig) {
        if (contrasenaActual == null || !passwordEncoder.matches(contrasenaActual, contrasenaOrig)) {
            throw new ContrasenaIncorrectaException("La contraseña actual es incorrecta");
        }
    }

    private String determinarRol(final String rol) {
        if (rol == null || rol.isBlank()) {
            return "ROLE_USUARIO";
        }
        return rol;
    }

    private UsuarioResponseDTO toResponseDTO(final Usuario usuario) {
        final UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setCorreoUsuario(usuario.getCorreoUsuario());
        dto.setRol(usuario.getRol().getNombre());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        return dto;
    }
}