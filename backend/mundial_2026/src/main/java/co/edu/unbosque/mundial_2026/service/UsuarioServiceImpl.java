package co.edu.unbosque.mundial_2026.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unbosque.mundial_2026.dto.request.UsuarioActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.PreferenciaDTO;
import co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO;
import co.edu.unbosque.mundial_2026.entity.CiudadFavorita;
import co.edu.unbosque.mundial_2026.entity.EstadioFavorito;
import co.edu.unbosque.mundial_2026.entity.Rol;
import co.edu.unbosque.mundial_2026.entity.Seleccion;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.ContrasenaIncorrectaException;
import co.edu.unbosque.mundial_2026.exception.CorreoEnUsoException;
import co.edu.unbosque.mundial_2026.exception.RolNotFoundException;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.CiudadRepository;
import co.edu.unbosque.mundial_2026.repository.EstadioRepository;
import co.edu.unbosque.mundial_2026.repository.RolRepository;
import co.edu.unbosque.mundial_2026.repository.SeleccionRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado";

    private final UsuarioRepository repository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final SeleccionRepository seleccionRepository;
    private final EstadioRepository estadioRepository;
    private final CiudadRepository ciudadRepository;

    public UsuarioServiceImpl(UsuarioRepository repository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder, SeleccionRepository seleccionRepository,
            EstadioRepository estadioRepository, CiudadRepository ciudadRepository) {
        this.repository = repository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.seleccionRepository = seleccionRepository;
        this.estadioRepository = estadioRepository;
        this.ciudadRepository = ciudadRepository;
    }
//retorna el dto de los usuarios que estan registrados en el aplicativo
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return repository.findAll().stream()
        .map(usuario -> toResponseDTO(usuario))
        .toList();
    }
//Registra al usuario guardandolo en la base de datos verificando los datos,aplicando las excepciones,hasheando la contraseña 
//En caso de que no ponga rol por defecto se le asginara ROL_USUARIO
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
//Actualiza los valores del usuario, es importante mandar si cambio el correo ya que se debe generar un nuevo token y hacer log out con el anterior
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


    @Override
    @Transactional(readOnly = true)
    public List<PreferenciaDTO> seleccionesUsuario(final String correo) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        return usuario.getSeleccionesU().stream()
                .map(s -> new PreferenciaDTO(s.getId(), s.getNombre()))
                .toList();//se devuelve preferenciaDTO para asi devolver el nombre y el id segun corresponda(seleccion,estadio,estado)
    }
//Agrega las selecciones mediante el id se verifica que no esten para no sobreescribirlas y se guardan en la bd
    @Override
    @Transactional
    public UsuarioResponseDTO agregarSeleccion(final String correo, final List<Long> idSelecciones) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        final List<Seleccion> nuevas = seleccionRepository.findAllById(idSelecciones);
        final List<Seleccion> actuales = new ArrayList<>(usuario.getSeleccionesU());
        for (int i = 0; i < nuevas.size(); i++) {
            if (!actuales.contains(nuevas.get(i))) {
                actuales.add(nuevas.get(i));
            }
        }
        usuario.setSeleccionesU(actuales);
        return toResponseDTO(repository.save(usuario));
    }

    @Override
    @Transactional
    public void eliminarSeleccion(final String correo, final Long seleccionId) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        usuario.setSeleccionesU(new ArrayList<>(usuario.getSeleccionesU()));
        usuario.getSeleccionesU().removeIf(s -> s.getId().equals(seleccionId));
        repository.save(usuario);
    }



    @Override
    @Transactional(readOnly = true)
    public List<PreferenciaDTO> estadiosUsuario(final String correo) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        return usuario.getPreferenciasu().stream()
                .map(e -> new PreferenciaDTO(e.getId(), e.getNombre()))
                .toList();
    }

    @Override
    @Transactional
    public UsuarioResponseDTO agregarEstadio(final String correo, final List<Long> idEstadios) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        final List<EstadioFavorito> nuevos = estadioRepository.findAllById(idEstadios);
        final List<EstadioFavorito> actuales = new ArrayList<>(usuario.getPreferenciasu());
        for (int i = 0; i < nuevos.size(); i++) {
            if (!actuales.contains(nuevos.get(i))) {
                actuales.add(nuevos.get(i));
            }
        }
        usuario.setPreferenciasu(actuales);
        return toResponseDTO(repository.save(usuario));
    }

    @Override
    @Transactional
    public void eliminarEstadio(final String correo, final Long estadioId) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        usuario.setPreferenciasu(new ArrayList<>(usuario.getPreferenciasu()));
        usuario.getPreferenciasu().removeIf(e -> e.getId().equals(estadioId));
        repository.save(usuario);
    }


    @Override
    @Transactional(readOnly = true)
    public List<PreferenciaDTO> ciudadesUsuario(final String correo) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        return usuario.getCiudadFavoritas().stream()
                .map(c -> new PreferenciaDTO(c.getId(), c.getNombre()))
                .toList();
    }

    @Override
    @Transactional
    public UsuarioResponseDTO agregarCiudad(final String correo, final List<Long> idCiudades) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        final List<CiudadFavorita> nuevas = ciudadRepository.findAllById(idCiudades);
        final List<CiudadFavorita> actuales = new ArrayList<>(usuario.getCiudadFavoritas());
        for (int i = 0; i < nuevas.size(); i++) {
            if (!actuales.contains(nuevas.get(i))) {
                actuales.add(nuevas.get(i));
            }
        }
        usuario.setCiudadFavoritas(actuales);
        return toResponseDTO(repository.save(usuario));
    }

    @Override
    @Transactional
    public void eliminarCiudad(final String correo, final Long ciudadId) {
        final Usuario usuario = repository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        usuario.setCiudadFavoritas(new ArrayList<>(usuario.getCiudadFavoritas()));
        usuario.getCiudadFavoritas().removeIf(c -> c.getId().equals(ciudadId));
        repository.save(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreferenciaDTO> listarEstadios() {
        return estadioRepository.findAll().stream()
                .map(e -> new PreferenciaDTO(e.getId(), e.getNombre()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreferenciaDTO> listarCiudades() {
        return ciudadRepository.findAll().stream()
                .map(c -> new PreferenciaDTO(c.getId(), c.getNombre()))
                .toList();
    }

//Verificaciones al momento de actualizar

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
            validarContrasenaActual(dto.getContrasenaActual(), contrasenaOrig);//verifica que coincidan
            usuario.setContrasena(passwordEncoder.encode(dto.getContrasenaNueva()));//Hace el hash
        }
    }
//Verificacion del correo
    private boolean actualizarCorreo(final Usuario usuario, final UsuarioActualizarRequestDTO dto,
            final String contrasenaOrig) {
        if (dto.getCorreoNuevo() != null && !dto.getCorreoNuevo().isBlank()) {
            validarContrasenaActual(dto.getContrasenaActual(), contrasenaOrig);
            if (repository.findByCorreoUsuario(dto.getCorreoNuevo()).isPresent()) {
                throw new CorreoEnUsoException("El correo ya está en uso");
            }
            usuario.setCorreoUsuario(dto.getCorreoNuevo());
            return true;
        }
        return false;
    }

    private void validarContrasenaActual(final String contrasenaActual, final String contrasenaOrig) {
        if (contrasenaActual == null || !passwordEncoder.matches(contrasenaActual, contrasenaOrig)) {
            throw new ContrasenaIncorrectaException("La contraseña actual es incorrecta");
        }
    }
//Determina el rol del usuario en caso de que no ponga nada
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