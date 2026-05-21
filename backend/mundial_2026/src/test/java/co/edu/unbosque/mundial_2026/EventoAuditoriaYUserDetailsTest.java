package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import co.edu.unbosque.mundial_2026.dto.EventoAuditoriaDTO;
import co.edu.unbosque.mundial_2026.entity.EventoAuditoria;
import co.edu.unbosque.mundial_2026.entity.Rol;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.repository.EventoAuditoriaRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;
import co.edu.unbosque.mundial_2026.service.EventoAuditoriaServiceImpl;
import co.edu.unbosque.mundial_2026.service.UserDetailsServiceImpl;
import co.edu.unbosque.mundial_2026.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
 class EventoAuditoriaYUserDetailsTest {

    // ── EventoAuditoriaServiceImpl ────────────────────────────────────────

    @Mock private EventoAuditoriaRepository auditoriaRepository;
    @Mock private UsuarioService usuarioService;

    @InjectMocks private EventoAuditoriaServiceImpl auditoriaService;

    // ── UserDetailsServiceImpl ────────────────────────────────────────────

    @Mock private UsuarioRepository usuarioRepository;

    @InjectMocks private UserDetailsServiceImpl userDetailsService;

    private Usuario crearUsuario(Long id, String correo, boolean activo) {
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario(correo);
        u.setContrasena("hashedPassword");
        u.setActivo(activo);
        u.setRol(rol);
        return u;
    }

    private EventoAuditoria crearEvento(Long id, String tipo, Usuario usuario) {
        EventoAuditoria e = new EventoAuditoria();
        e.setId(id);
        e.setTipo(tipo);
        e.setDescripcion("Descripcion test");
        e.setFecha(LocalDateTime.now());
        e.setIdCorrelacion("corr-" + id);
        e.setEntidadCorrelacion("USUARIO");
        e.setUsuario(usuario);
        return e;
    }

    // ── TESTS EventoAuditoriaServiceImpl ──────────────────────────────────

    @Test
    void registrar_conUsuario_guardaEvento() {
        Usuario usuario = crearUsuario(1L, "user@test.com", true);

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(auditoriaRepository.save(any(EventoAuditoria.class))).thenReturn(new EventoAuditoria());

        auditoriaService.registrar("LOGIN", "Usuario inició sesión", 1L, "corr-1", "AUTH");

        verify(auditoriaRepository).save(any(EventoAuditoria.class));
    }

    @Test
    void registrar_sinUsuario_guardaEventoSinUsuario() {
        when(auditoriaRepository.save(any(EventoAuditoria.class))).thenReturn(new EventoAuditoria());

        auditoriaService.registrar("SISTEMA", "Evento del sistema", null, "corr-1", "SISTEMA");

        verify(auditoriaRepository).save(any(EventoAuditoria.class));
        verify(usuarioService, never()).obtenerEntidadPorId(any());
    }

    @Test
    void buscarPorUsuario_conEventos_retornaLista() {
        Usuario usuario = crearUsuario(1L, "user@test.com", true);
        EventoAuditoria evento = crearEvento(1L, "LOGIN", usuario);

        when(auditoriaRepository.findByUsuarioId(1L)).thenReturn(List.of(evento));

        List<EventoAuditoriaDTO> resultado = auditoriaService.buscarPorUsuario(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void buscarPorUsuario_sinEventos_retornaVacio() {
        when(auditoriaRepository.findByUsuarioId(99L)).thenReturn(List.of());

        List<EventoAuditoriaDTO> resultado = auditoriaService.buscarPorUsuario(99L);

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    @Test
    void buscarPorTipo_retornaLista() {
        Usuario usuario = crearUsuario(1L, "user@test.com", true);
        EventoAuditoria evento = crearEvento(1L, "LOGIN", usuario);

        when(auditoriaRepository.findByTipo("LOGIN")).thenReturn(List.of(evento));

        List<EventoAuditoriaDTO> resultado = auditoriaService.buscarPorTipo("LOGIN");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void buscarPorCorrelacion_retornaLista() {
        Usuario usuario = crearUsuario(1L, "user@test.com", true);
        EventoAuditoria evento = crearEvento(1L, "LOGIN", usuario);

        when(auditoriaRepository.findByIdCorrelacion("corr-1")).thenReturn(List.of(evento));

        List<EventoAuditoriaDTO> resultado = auditoriaService.buscarPorCorrelacion("corr-1");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void buscarPorEntidad_retornaLista() {
        Usuario usuario = crearUsuario(1L, "user@test.com", true);
        EventoAuditoria evento = crearEvento(1L, "LOGIN", usuario);

        when(auditoriaRepository.findByEntidadCorrelacion("USUARIO")).thenReturn(List.of(evento));

        List<EventoAuditoriaDTO> resultado = auditoriaService.buscarPorEntidad("USUARIO");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void buscarPorFecha_retornaLista() {
        Usuario usuario = crearUsuario(1L, "user@test.com", true);
        EventoAuditoria evento = crearEvento(1L, "LOGIN", usuario);
        LocalDateTime inicio = LocalDateTime.now().minusDays(1);
        LocalDateTime fin = LocalDateTime.now();

        when(auditoriaRepository.findByFechaBetween(inicio, fin)).thenReturn(List.of(evento));

        List<EventoAuditoriaDTO> resultado = auditoriaService.buscarPorFecha(inicio, fin);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    // ── TESTS UserDetailsServiceImpl ──────────────────────────────────────

    @Test
    void loadUserByUsername_usuarioActivo_retornaUserDetails() {
        Usuario usuario = crearUsuario(1L, "user@test.com", true);

        when(usuarioRepository.findByCorreoUsuario("user@test.com")).thenReturn(Optional.of(usuario));

        UserDetails resultado = userDetailsService.loadUserByUsername("user@test.com");

        assertNotNull(resultado);
        assertEquals("user@test.com", resultado.getUsername());
        assertTrue(resultado.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USUARIO")));
    }

    @Test
    void loadUserByUsername_usuarioNoExistente_lanzaExcepcion() {
        when(usuarioRepository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("noexiste@test.com"));
    }

    @Test
    void loadUserByUsername_usuarioInactivo_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com", false);

        when(usuarioRepository.findByCorreoUsuario("user@test.com")).thenReturn(Optional.of(usuario));

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("user@test.com"));
    }
}
