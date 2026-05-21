package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import co.edu.unbosque.mundial_2026.dto.NotificacionDTO;
import co.edu.unbosque.mundial_2026.dto.request.NotificacionRequestDTO;
import co.edu.unbosque.mundial_2026.entity.*;
import co.edu.unbosque.mundial_2026.exception.PartidoNotFoundException;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.*;
import co.edu.unbosque.mundial_2026.service.EventoAuditoriaService;
import co.edu.unbosque.mundial_2026.service.NotificacionServiceImpl;

@ExtendWith(MockitoExtension.class)
 class NotificacionServiceImplTest {

    @Mock private NotificacionRepository notificacionRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PartidoRepository partidoRepository;
    @Mock private EventoAuditoriaService eventoAuditoriaService;

    @InjectMocks private NotificacionServiceImpl service;

    private Usuario crearUsuario(Long id, boolean activo) {
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario("user" + id + "@test.com");
        u.setActivo(activo);
        u.setRol(rol);
        u.setSeleccionesU(new java.util.ArrayList<>());
        return u;
    }

    private Notificacion crearNotificacion(Long id, Usuario usuario, boolean leida) {
        Notificacion n = new Notificacion(
                "INFO", "Titulo test", "Mensaje test",
                "SISTEMA", "ENVIADA", usuario);
        n.setId(id);
        n.setLeida(leida);
        return n;
    }

    // ── listarPorUsuario ──────────────────────────────────────────────────

    @Test
    void listarPorUsuario_usuarioExistente_retornaLista() {
        Usuario usuario = crearUsuario(1L, true);
        Notificacion notificacion = crearNotificacion(1L, usuario, false);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(notificacionRepository.findByUsuario(usuario)).thenReturn(List.of(notificacion));

        List<NotificacionDTO> resultado = service.listarPorUsuario(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertFalse(resultado.get(0).isLeida());
    }

    @Test
    void listarPorUsuario_usuarioNoExistente_lanzaExcepcion() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.listarPorUsuario(99L));
    }

    @Test
    void listarPorUsuario_sinNotificaciones_retornaVacio() {
        Usuario usuario = crearUsuario(1L, true);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(notificacionRepository.findByUsuario(usuario)).thenReturn(List.of());

        List<NotificacionDTO> resultado = service.listarPorUsuario(1L);

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    // ── marcarLeida ───────────────────────────────────────────────────────

    @Test
    void marcarLeida_notificacionExistente_marcaComoLeida() {
        Usuario usuario = crearUsuario(1L, true);
        Notificacion notificacion = crearNotificacion(1L, usuario, false);

        when(notificacionRepository.findById(1L)).thenReturn(Optional.of(notificacion));
        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(notificacion);

        service.marcarLeida(1L);

        assertTrue(notificacion.isLeida());
        verify(notificacionRepository).save(notificacion);
    }

    @Test
    void marcarLeida_notificacionNoExistente_lanzaExcepcion() {
        when(notificacionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.marcarLeida(99L));
    }

    // ── marcarTodasLeidas ─────────────────────────────────────────────────

    @Test
    void marcarTodasLeidas_usuarioExistente_marcaTodasLeidas() {
        Usuario usuario = crearUsuario(1L, true);
        Notificacion n1 = crearNotificacion(1L, usuario, false);
        Notificacion n2 = crearNotificacion(2L, usuario, false);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(notificacionRepository.findByUsuario(usuario)).thenReturn(List.of(n1, n2));
        when(notificacionRepository.saveAll(any())).thenReturn(List.of(n1, n2));

        service.marcarTodasLeidas(1L);

        assertTrue(n1.isLeida());
        assertTrue(n2.isLeida());
        verify(notificacionRepository).saveAll(any());
    }

    @Test
    void marcarTodasLeidas_usuarioNoExistente_lanzaExcepcion() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.marcarTodasLeidas(99L));
    }

    // ── notificarRegistro ─────────────────────────────────────────────────

    @Test
    void notificarRegistro_usuarioSinToken_guardaNotificacion() {
        Usuario usuario = crearUsuario(1L, true);
        usuario.setFcmtoken(null);

        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(new Notificacion());
        doNothing().when(eventoAuditoriaService).registrar(any(), any(), any(), any(), any());

        service.notificarRegistro(usuario);

        verify(notificacionRepository).save(any(Notificacion.class));
    }

    // ── notificarActualizacionPerfil ──────────────────────────────────────

    @Test
    void notificarActualizacionPerfil_usuarioSinToken_guardaNotificacion() {
        Usuario usuario = crearUsuario(1L, true);
        usuario.setFcmtoken(null);

        when(notificacionRepository.save(any(Notificacion.class))).thenReturn(new Notificacion());
        doNothing().when(eventoAuditoriaService).registrar(any(), any(), any(), any(), any());

        service.notificarActualizacionPerfil(usuario);

        verify(notificacionRepository).save(any(Notificacion.class));
    }

    // ── enviarMasiva ──────────────────────────────────────────────────────

    @Test
    void enviarMasiva_sinUsuarioIds_enviaATodos() {
        Usuario usuario = crearUsuario(1L, true);

        co.edu.unbosque.mundial_2026.dto.request.NotificacionMasivaRequestDTO dto =
                new co.edu.unbosque.mundial_2026.dto.request.NotificacionMasivaRequestDTO();
        dto.setTipo("INFO");
        dto.setTitulo("Titulo");
        dto.setMensaje("Mensaje");
        dto.setCanal("SISTEMA");
        dto.setUsuarioIds(null);

        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));
        when(notificacionRepository.saveAll(any())).thenReturn(List.of());
        doNothing().when(eventoAuditoriaService).registrar(any(), any(), any(), any(), any());

        service.enviarMasiva(dto);

        verify(notificacionRepository).saveAll(any());
    }

    @Test
    void enviarMasiva_conUsuarioIds_enviaAEspecificos() {
        Usuario usuario = crearUsuario(1L, true);

        co.edu.unbosque.mundial_2026.dto.request.NotificacionMasivaRequestDTO dto =
                new co.edu.unbosque.mundial_2026.dto.request.NotificacionMasivaRequestDTO();
        dto.setTipo("INFO");
        dto.setTitulo("Titulo");
        dto.setMensaje("Mensaje");
        dto.setCanal("SISTEMA");
        dto.setUsuarioIds(List.of(1L));

        when(usuarioRepository.findAllById(List.of(1L))).thenReturn(List.of(usuario));
        when(notificacionRepository.saveAll(any())).thenReturn(List.of());
        doNothing().when(eventoAuditoriaService).registrar(any(), any(), any(), any(), any());

        service.enviarMasiva(dto);

        verify(notificacionRepository).saveAll(any());
    }
    @Test
void enviarNotificacion_usuarioExistente_guardaYEnvia() {
    Usuario usuario = crearUsuario(1L, true);
    usuario.setFcmtoken(null);

    NotificacionRequestDTO dto = new NotificacionRequestDTO();
    dto.setUsuarioId(1L);
    dto.setTipo("INFO");
    dto.setTitulo("Test");
    dto.setMensaje("Mensaje test");
    dto.setCanal("SISTEMA");

    when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
    when(notificacionRepository.save(any(Notificacion.class))).thenReturn(new Notificacion());
    doNothing().when(eventoAuditoriaService).registrar(any(), any(), any(), any(), any());

    service.enviarNotificacion(dto);

    verify(notificacionRepository).save(any(Notificacion.class));
}

@Test
void enviarNotificacion_usuarioNoExistente_lanzaExcepcion() {
    NotificacionRequestDTO dto = new NotificacionRequestDTO();
    dto.setUsuarioId(99L);

    when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(UsuarioNotFoundException.class,
            () -> service.enviarNotificacion(dto));
}

@Test
void notificarPorPartido_partidoExistente_notificaUsuarios() {
    Partido partido = new Partido();
    partido.setId(1L);
    partido.setSeleccionLocal("Colombia");
    partido.setSeleccionVisitante("Brazil");

    Usuario usuario = crearUsuario(1L, true);
    co.edu.unbosque.mundial_2026.entity.Seleccion seleccion =
            new co.edu.unbosque.mundial_2026.entity.Seleccion();
    seleccion.setNombre("Colombia");
    usuario.setSeleccionesU(List.of(seleccion));
    usuario.setFcmtoken(null);

    when(partidoRepository.findById(1L)).thenReturn(Optional.of(partido));
    when(usuarioRepository.findAll()).thenReturn(List.of(usuario));
    when(notificacionRepository.saveAll(any())).thenReturn(List.of());
    doNothing().when(eventoAuditoriaService).registrar(any(), any(), any(), any(), any());

    service.notificarPorPartido(1L, "INFO", "Titulo", "Mensaje");

    verify(notificacionRepository).saveAll(any());
}

@Test
void notificarPorPartido_partidoNoExistente_lanzaExcepcion() {
    when(partidoRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(PartidoNotFoundException.class,
            () -> service.notificarPorPartido(99L, "INFO", "Titulo", "Mensaje"));
}

}
