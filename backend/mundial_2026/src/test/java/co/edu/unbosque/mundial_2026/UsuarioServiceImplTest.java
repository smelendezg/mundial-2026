package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import co.edu.unbosque.mundial_2026.dto.request.UsuarioActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Rol;
import co.edu.unbosque.mundial_2026.entity.Seleccion;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.ContrasenaIncorrectaException;
import co.edu.unbosque.mundial_2026.exception.CorreoEnUsoException;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.CiudadRepository;
import co.edu.unbosque.mundial_2026.repository.EstadioRepository;
import co.edu.unbosque.mundial_2026.repository.RolRepository;
import co.edu.unbosque.mundial_2026.repository.SeleccionRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;
import co.edu.unbosque.mundial_2026.service.UsuarioServiceImpl;
import java.util.Map;

import java.util.List;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SeleccionRepository seleccionRepository;

    @Mock
    private EstadioRepository estadioRepository;

    @Mock
    private CiudadRepository ciudadRepository;

    @InjectMocks
    private UsuarioServiceImpl service;

    // ── REGISTRAR USUARIO ─────────────────────────────────────────────────

    @Test
    void registrar_correoNuevo_retornaDTO() {
        // GIVEN
        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setCorreoUsuario("seb@test.com");
        dto.setContrasena("12345678");
        dto.setNombre("Seb");
        dto.setApellido("Lopez");

        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");

        Usuario usuarioGuardado = new Usuario();
        usuarioGuardado.setId(1L);
        usuarioGuardado.setCorreoUsuario("seb@test.com");
        usuarioGuardado.setNombre("Seb");
        usuarioGuardado.setApellido("Lopez");
        usuarioGuardado.setRol(rol);

        when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.empty());
        when(rolRepository.findByNombre("ROLE_USUARIO")).thenReturn(Optional.of(rol));
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        // WHEN
        UsuarioResponseDTO resultado = service.registrarUsuario(dto);

        // THEN
        assertNotNull(resultado);
        assertEquals("seb@test.com", resultado.getCorreoUsuario());
        assertEquals("Seb", resultado.getNombre());
    }

    @Test
    void registrar_correoEnUso_lanzaExcepcion() {
        // GIVEN
        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setCorreoUsuario("seb@test.com");

        when(repository.findByCorreoUsuario("seb@test.com"))
                .thenReturn(Optional.of(new Usuario()));

        // WHEN + THEN
        assertThrows(CorreoEnUsoException.class,
                () -> service.registrarUsuario(dto));
    }

    // ── OBTENER USUARIO ───────────────────────────────────────────────────

    @Test
    void obtenerUsuario_idExistente_retornaDTO() {
        // GIVEN
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");

        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setCorreoUsuario("seb@test.com");
        usuario.setNombre("Seb");
        usuario.setApellido("Lopez");
        usuario.setRol(rol);

        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        // WHEN
        UsuarioResponseDTO resultado = service.obtenerUsuario(1L);

        // THEN
        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
    }

    @Test
    void obtenerUsuario_idNoExistente_lanzaExcepcion() {
        // GIVEN
        when(repository.findById(99L)).thenReturn(Optional.empty());

        // WHEN + THEN
        assertThrows(UsuarioNotFoundException.class,
                () -> service.obtenerUsuario(99L));
    }

    // ── ELIMINAR USUARIO ──────────────────────────────────────────────────

    @Test
    void eliminarUsuario_idExistente_desactivaUsuario() {
        // GIVEN
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setActivo(true);

        when(repository.findById(1L)).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenReturn(usuario);

        // WHEN
        service.eliminarUsuario(1L);

        // THEN
        verify(repository).save(any(Usuario.class));
        assertEquals(false, usuario.isActivo());
    }

    @Test
    void eliminarUsuario_idNoExistente_lanzaExcepcion() {
        // GIVEN
        when(repository.findById(99L)).thenReturn(Optional.empty());

        // WHEN + THEN
        assertThrows(UsuarioNotFoundException.class,
                () -> service.eliminarUsuario(99L));
    }
    // ── ACTUALIZAR PERFIL ─────────────────────────────────────────────────

@Test
void actualizarPerfil_nombreCambia_retornaDTO() {
    // GIVEN
    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setNombre("Seb");
    usuario.setApellido("Lopez");
    usuario.setRol(rol);
    usuario.setContrasena("hashedPassword");

    UsuarioActualizarRequestDTO dto = new UsuarioActualizarRequestDTO();
    dto.setNombre("Sebastian");

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    Map<String, Object> resultado = service.actualizarPerfil("seb@test.com", dto);

    // THEN
    assertNotNull(resultado);
    assertEquals(false, resultado.get("correocambio"));
}

@Test
void actualizarPerfil_correoNuevo_marcaCorreoCambio() {
    // GIVEN
    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setNombre("Seb");
    usuario.setApellido("Lopez");
    usuario.setRol(rol);
    usuario.setContrasena("hashedPassword");

    UsuarioActualizarRequestDTO dto = new UsuarioActualizarRequestDTO();
    dto.setCorreoNuevo("nuevo@test.com");
    dto.setContrasenaActual("12345678");

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(repository.findByCorreoUsuario("nuevo@test.com")).thenReturn(Optional.empty());
    when(passwordEncoder.matches("12345678", "hashedPassword")).thenReturn(true);
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    Map<String, Object> resultado = service.actualizarPerfil("seb@test.com", dto);

    // THEN
    assertEquals(true, resultado.get("correocambio"));
}

@Test
void actualizarPerfil_contrasenaActualIncorrecta_lanzaExcepcion() {
    // GIVEN
    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setContrasena("hashedPassword");

    UsuarioActualizarRequestDTO dto = new UsuarioActualizarRequestDTO();
    dto.setContrasenaNueva("nuevaPass123");
    dto.setContrasenaActual("incorrecta");

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(passwordEncoder.matches("incorrecta", "hashedPassword")).thenReturn(false);

    // WHEN + THEN
    assertThrows(ContrasenaIncorrectaException.class,
            () -> service.actualizarPerfil("seb@test.com", dto));
}

@Test
void actualizarPerfil_correoNuevoEnUso_lanzaExcepcion() {
    // GIVEN
    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setContrasena("hashedPassword");

    UsuarioActualizarRequestDTO dto = new UsuarioActualizarRequestDTO();
    dto.setCorreoNuevo("ocupado@test.com");
    dto.setContrasenaActual("12345678");

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(repository.findByCorreoUsuario("ocupado@test.com")).thenReturn(Optional.of(new Usuario()));
    when(passwordEncoder.matches("12345678", "hashedPassword")).thenReturn(true);

    // WHEN + THEN
    assertThrows(CorreoEnUsoException.class,
            () -> service.actualizarPerfil("seb@test.com", dto));
}

// ── PREFERENCIAS ─────────────────────────────────────────────────────

@Test
void seleccionesUsuario_usuarioExistente_retornaLista() {
    // GIVEN
    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setSeleccionesU(new java.util.ArrayList<>());

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));

    // WHEN
    var resultado = service.seleccionesUsuario("seb@test.com");

    // THEN
    assertNotNull(resultado);
}

@Test
void seleccionesUsuario_usuarioNoExistente_lanzaExcepcion() {
    // GIVEN
    when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

    // WHEN + THEN
    assertThrows(UsuarioNotFoundException.class,
            () -> service.seleccionesUsuario("noexiste@test.com"));
}
// ── AGREGAR SELECCIÓN ─────────────────────────────────────────────────

@Test
void agregarSeleccion_usuarioExistente_retornaDTO() {
    // GIVEN
    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");

    Seleccion seleccion = new Seleccion();
    seleccion.setId(1L);
    seleccion.setNombre("Colombia");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setNombre("Seb");
    usuario.setApellido("Lopez");
    usuario.setRol(rol);
    usuario.setSeleccionesU(new java.util.ArrayList<>());

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(seleccionRepository.findAllById(any())).thenReturn(List.of(seleccion));
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    UsuarioResponseDTO resultado = service.agregarSeleccion("seb@test.com", List.of(1L));

    // THEN
    assertNotNull(resultado);
    verify(repository).save(any(Usuario.class));
}

@Test
void agregarSeleccion_usuarioNoExistente_lanzaExcepcion() {
    // GIVEN
    when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

    // WHEN + THEN
    assertThrows(UsuarioNotFoundException.class,
            () -> service.agregarSeleccion("noexiste@test.com", List.of(1L)));
}

// ── ELIMINAR SELECCIÓN ────────────────────────────────────────────────

@Test
void eliminarSeleccion_usuarioExistente_eliminaCorrectamente() {
    // GIVEN
    Seleccion seleccion = new Seleccion();
    seleccion.setId(1L);
    seleccion.setNombre("Colombia");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setSeleccionesU(new java.util.ArrayList<>(List.of(seleccion)));

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    service.eliminarSeleccion("seb@test.com", 1L);

    // THEN
    verify(repository).save(any(Usuario.class));
    assertEquals(0, usuario.getSeleccionesU().size());
}

@Test
void eliminarSeleccion_usuarioNoExistente_lanzaExcepcion() {
    // GIVEN
    when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

    // WHEN + THEN
    assertThrows(UsuarioNotFoundException.class,
            () -> service.eliminarSeleccion("noexiste@test.com", 1L));
}

// ── ESTADIOS FAVORITOS ────────────────────────────────────────────────

@Test
void estadiosUsuario_usuarioExistente_retornaLista() {
    // GIVEN
    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setPreferenciasu(new java.util.ArrayList<>());

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));

    // WHEN
    var resultado = service.estadiosUsuario("seb@test.com");

    // THEN
    assertNotNull(resultado);
}

@Test
void eliminarEstadio_usuarioExistente_eliminaCorrectamente() {
    // GIVEN
    co.edu.unbosque.mundial_2026.entity.EstadioFavorito estadio = 
        new co.edu.unbosque.mundial_2026.entity.EstadioFavorito();
    estadio.setId(1L);
    estadio.setNombre("MetLife Stadium");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setPreferenciasu(new java.util.ArrayList<>(List.of(estadio)));

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    service.eliminarEstadio("seb@test.com", 1L);

    // THEN
    verify(repository).save(any(Usuario.class));
    assertEquals(0, usuario.getPreferenciasu().size());
}

// ── CIUDADES FAVORITAS ────────────────────────────────────────────────

@Test
void ciudadesUsuario_usuarioExistente_retornaLista() {
    // GIVEN
    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setCiudadFavoritas(new java.util.ArrayList<>());

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));

    // WHEN
    var resultado = service.ciudadesUsuario("seb@test.com");

    // THEN
    assertNotNull(resultado);
}

@Test
void eliminarCiudad_usuarioExistente_eliminaCorrectamente() {
    // GIVEN
    co.edu.unbosque.mundial_2026.entity.CiudadFavorita ciudad = 
        new co.edu.unbosque.mundial_2026.entity.CiudadFavorita();
    ciudad.setId(1L);
    ciudad.setNombre("Nueva York");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setCiudadFavoritas(new java.util.ArrayList<>(List.of(ciudad)));

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    service.eliminarCiudad("seb@test.com", 1L);

    // THEN
    verify(repository).save(any(Usuario.class));
    assertEquals(0, usuario.getCiudadFavoritas().size());
}

@Test
void agregarEstadio_usuarioExistente_retornaDTO() {
    // GIVEN
    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");

    co.edu.unbosque.mundial_2026.entity.EstadioFavorito estadio =
        new co.edu.unbosque.mundial_2026.entity.EstadioFavorito();
    estadio.setId(1L);
    estadio.setNombre("MetLife Stadium");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setNombre("Seb");
    usuario.setApellido("Lopez");
    usuario.setRol(rol);
    usuario.setPreferenciasu(new java.util.ArrayList<>());

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(estadioRepository.findAllById(any())).thenReturn(List.of(estadio));
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    UsuarioResponseDTO resultado = service.agregarEstadio("seb@test.com", List.of(1L));

    // THEN
    assertNotNull(resultado);
    verify(repository).save(any(Usuario.class));
}

@Test
void agregarEstadio_usuarioNoExistente_lanzaExcepcion() {
    // GIVEN
    when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

    // WHEN + THEN
    assertThrows(UsuarioNotFoundException.class,
            () -> service.agregarEstadio("noexiste@test.com", List.of(1L)));
}

@Test
void agregarCiudad_usuarioExistente_retornaDTO() {
    // GIVEN
    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");

    co.edu.unbosque.mundial_2026.entity.CiudadFavorita ciudad =
        new co.edu.unbosque.mundial_2026.entity.CiudadFavorita();
    ciudad.setId(1L);
    ciudad.setNombre("Nueva York");

    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setNombre("Seb");
    usuario.setApellido("Lopez");
    usuario.setRol(rol);
    usuario.setCiudadFavoritas(new java.util.ArrayList<>());

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    when(ciudadRepository.findAllById(any())).thenReturn(List.of(ciudad));
    when(repository.save(any(Usuario.class))).thenReturn(usuario);

    // WHEN
    UsuarioResponseDTO resultado = service.agregarCiudad("seb@test.com", List.of(1L));

    // THEN
    assertNotNull(resultado);
    verify(repository).save(any(Usuario.class));
}

@Test
void agregarCiudad_usuarioNoExistente_lanzaExcepcion() {
    // GIVEN
    when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

    // WHEN + THEN
    assertThrows(UsuarioNotFoundException.class,
            () -> service.agregarCiudad("noexiste@test.com", List.of(1L)));
}
@Test
void listarTodos_retornaLista() {
    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");
    Usuario usuario = new Usuario();
    usuario.setId(1L);
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setNombre("Seb");
    usuario.setApellido("Lopez");
    usuario.setRol(rol);

    when(repository.findAll()).thenReturn(List.of(usuario));
    var resultado = service.listarTodos();
    assertEquals(1, resultado.size());
    assertEquals("seb@test.com", resultado.get(0).getCorreoUsuario());
}

@Test
void listarTodos_listaVacia() {
    when(repository.findAll()).thenReturn(java.util.Collections.emptyList());
    assertTrue(service.listarTodos().isEmpty());
}

@Test
void obtenerPorCorreo_encontrado_retornaDTO() {
    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");
    Usuario usuario = new Usuario();
    usuario.setCorreoUsuario("seb@test.com");
    usuario.setNombre("Seb");
    usuario.setApellido("Lopez");
    usuario.setRol(rol);

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
    UsuarioResponseDTO resultado = service.obtenerPorCorreo("seb@test.com");
    assertNotNull(resultado);
    assertEquals("seb@test.com", resultado.getCorreoUsuario());
}

@Test
void listarEstadios_retornaLista() {
    co.edu.unbosque.mundial_2026.entity.EstadioFavorito e =
        new co.edu.unbosque.mundial_2026.entity.EstadioFavorito();
    e.setId(1L);
    e.setNombre("Azteca");

    when(estadioRepository.findAll()).thenReturn(List.of(e));
    var resultado = service.listarEstadios();
    assertEquals(1, resultado.size());
    assertEquals("Azteca", resultado.get(0).getNombre());
}

@Test
void listarCiudades_retornaLista() {
    co.edu.unbosque.mundial_2026.entity.CiudadFavorita c =
        new co.edu.unbosque.mundial_2026.entity.CiudadFavorita();
    c.setId(1L);
    c.setNombre("Dallas");

    when(ciudadRepository.findAll()).thenReturn(List.of(c));
    var resultado = service.listarCiudades();
    assertEquals(1, resultado.size());
    assertEquals("Dallas", resultado.get(0).getNombre());
}

@Test
void registrar_rolNulo_asignaRolUsuarioPorDefecto() {
    UsuarioRequestDTO dto = new UsuarioRequestDTO();
    dto.setCorreoUsuario("seb@test.com");
    dto.setContrasena("12345678");
    dto.setNombre("Seb");
    dto.setApellido("Lopez");
    dto.setRol(null);

    Rol rol = new Rol();
    rol.setNombre("ROLE_USUARIO");
    Usuario usuarioGuardado = new Usuario();
    usuarioGuardado.setCorreoUsuario("seb@test.com");
    usuarioGuardado.setNombre("Seb");
    usuarioGuardado.setApellido("Lopez");
    usuarioGuardado.setRol(rol);

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.empty());
    when(rolRepository.findByNombre("ROLE_USUARIO")).thenReturn(Optional.of(rol));
    when(passwordEncoder.encode(anyString())).thenReturn("hashed");
    when(repository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

    UsuarioResponseDTO resultado = service.registrarUsuario(dto);
    assertNotNull(resultado);
    verify(rolRepository).findByNombre("ROLE_USUARIO");
}

@Test
void registrar_rolNoEncontrado_lanzaExcepcion() {
    UsuarioRequestDTO dto = new UsuarioRequestDTO();
    dto.setCorreoUsuario("seb@test.com");
    dto.setContrasena("12345678");
    dto.setRol("ROLE_INEXISTENTE");

    when(repository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.empty());
    when(rolRepository.findByNombre("ROLE_INEXISTENTE")).thenReturn(Optional.empty());

    assertThrows(co.edu.unbosque.mundial_2026.exception.RolNotFoundException.class,
            () -> service.registrarUsuario(dto));
}
}
