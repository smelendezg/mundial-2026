package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import co.edu.unbosque.mundial_2026.entity.Rol;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.CiudadRepository;
import co.edu.unbosque.mundial_2026.repository.EstadioRepository;
import co.edu.unbosque.mundial_2026.repository.RolRepository;
import co.edu.unbosque.mundial_2026.repository.SeleccionRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;
import co.edu.unbosque.mundial_2026.service.NotificacionService;
import co.edu.unbosque.mundial_2026.service.UsuarioServiceImpl;

@ExtendWith(MockitoExtension.class)
 class UsuarioServiceImplAdicionalesTest {

    @Mock private UsuarioRepository repository;
    @Mock private RolRepository rolRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private SeleccionRepository seleccionRepository;
    @Mock private EstadioRepository estadioRepository;
    @Mock private CiudadRepository ciudadRepository;
    @Mock private NotificacionService notificacionService;

    @InjectMocks private UsuarioServiceImpl service;

    private Usuario crearUsuario(Long id, String correo) {
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario(correo);
        u.setNombre("Juan");
        u.setApellido("Perez");
        u.setContrasena("hashedPassword");
        u.setActivo(true);
        u.setRol(rol);
        return u;
    }

    @Test
    void obtenerEntidadPorId_existente_retornaEntidad() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        Usuario resultado = service.obtenerEntidadPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
    }

    @Test
    void obtenerEntidadPorId_noExistente_lanzaExcepcion() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.obtenerEntidadPorId(99L));
    }

    @Test
    void obtenerEntidadPorCorreo_existente_retornaEntidad() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        when(repository.findByCorreoUsuario("user@test.com")).thenReturn(Optional.of(usuario));

        Usuario resultado = service.obtenerEntidadPorCorreo("user@test.com");

        assertNotNull(resultado);
        assertEquals("user@test.com", resultado.getCorreoUsuario());
    }

    @Test
    void obtenerEntidadPorCorreo_noExistente_lanzaExcepcion() {
        when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.obtenerEntidadPorCorreo("noexiste@test.com"));
    }

    @Test
    void actualizarFcmToken_usuarioExistente_guardaToken() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        when(repository.findByCorreoUsuario("user@test.com")).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenReturn(usuario);

        service.actualizarFcmToken("user@test.com", "fcm-token-123");

        assertEquals("fcm-token-123", usuario.getFcmtoken());
        verify(repository).save(usuario);
    }

    @Test
    void actualizarFcmToken_usuarioNoExistente_lanzaExcepcion() {
        when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.actualizarFcmToken("noexiste@test.com", "token"));
    }

    @Test
    void obtenerPorCorreo_existente_retornaDTO() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        when(repository.findByCorreoUsuario("user@test.com")).thenReturn(Optional.of(usuario));

        var resultado = service.obtenerPorCorreo("user@test.com");

        assertNotNull(resultado);
        assertEquals("user@test.com", resultado.getCorreoUsuario());
    }

    @Test
    void obtenerPorCorreo_noExistente_lanzaExcepcion() {
        when(repository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.obtenerPorCorreo("noexiste@test.com"));
    }
}
