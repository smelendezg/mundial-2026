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

import co.edu.unbosque.mundial_2026.dto.ApuestaDTO;
import co.edu.unbosque.mundial_2026.dto.PronosticoDTO;
import co.edu.unbosque.mundial_2026.dto.ParticipacionDTO;
import co.edu.unbosque.mundial_2026.dto.request.ApuestaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO;
import co.edu.unbosque.mundial_2026.entity.*;
import co.edu.unbosque.mundial_2026.exception.*;
import co.edu.unbosque.mundial_2026.repository.*;
import co.edu.unbosque.mundial_2026.service.*;

@ExtendWith(MockitoExtension.class)
class ApuestaServiceImplTest {

    @Mock private ApuestaRepository apuestaRepository;
    @Mock private PronosticoRepository pronosticoRepository;
    @Mock private ParticipacionRepository participacionRepository;
    @Mock private UsuarioService usuarioService;
    @Mock private PartidoService partidoService;

    @InjectMocks private ApuestaServiceImpl service;

    private Usuario crearUsuario(Long id) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario("user" + id + "@test.com");
        return u;
    }

    private Apuesta crearApuesta(Long id, String estado, Usuario creador) {
        Apuesta a = new Apuesta();
        a.setId(id);
        a.setNombre("Polla Test");
        a.setEstado(estado);
        a.setCodigoInvitacion("codigo-" + id);
        a.setFechaCierre(LocalDateTime.now().plusDays(7));
        a.setCreadaPor(creador);
        return a;
    }

    private Participacion crearParticipacion(Long id, Usuario usuario, Apuesta apuesta) {
        Participacion p = new Participacion();
        p.setId(id);
        p.setUsuario(usuario);
        p.setApuesta(apuesta);
        p.setPuntos(0);
        return p;
    }

    private Partido crearPartido(Long id) {
        Partido p = new Partido();
        p.setId(id);
        p.setSeleccionLocal("Colombia");
        p.setSeleccionVisitante("Brazil");
        p.setGolesLocal(2);
        p.setGolesVisitante(1);
        p.setFecha(LocalDateTime.now().minusDays(1));
        return p;
    }

    // ── CREAR APUESTA ─────────────────────────────────────────────────────

    @Test
    void crearApuesta_datosValidos_retornaDTO() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Participacion participacion = crearParticipacion(1L, usuario, apuesta);

        ApuestaRequestDTO dto = new ApuestaRequestDTO();
        dto.setNombre("Polla Test");
        dto.setFechaCierre(LocalDateTime.now().plusDays(7));
        dto.setUsuarioId(1L);

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(apuestaRepository.save(any(Apuesta.class))).thenReturn(apuesta);
        when(participacionRepository.save(any(Participacion.class))).thenReturn(participacion);

        ApuestaDTO resultado = service.crearApuesta(dto);

        assertNotNull(resultado);
        assertEquals("ABIERTA", resultado.getEstado());
        verify(apuestaRepository).save(any(Apuesta.class));
        verify(participacionRepository).save(any(Participacion.class));
    }

    // ── UNIRSE APUESTA ────────────────────────────────────────────────────

    @Test
    void unirseApuesta_codigoValido_retornaDTO() {
        Usuario usuario = crearUsuario(2L);
        Usuario creador = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", creador);
        Participacion participacion = crearParticipacion(2L, usuario, apuesta);

        when(usuarioService.obtenerEntidadPorId(2L)).thenReturn(usuario);
        when(apuestaRepository.findByCodigoInvitacion("codigo-1")).thenReturn(Optional.of(apuesta));
        when(participacionRepository.findByUsuarioIdAndApuestaId(2L, 1L)).thenReturn(Optional.empty());
        when(participacionRepository.save(any(Participacion.class))).thenReturn(participacion);

        ApuestaDTO resultado = service.unirseApuesta("codigo-1", 2L);

        assertNotNull(resultado);
        verify(participacionRepository).save(any(Participacion.class));
    }

    @Test
    void unirseApuesta_codigoInvalido_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(apuestaRepository.findByCodigoInvitacion("codigo-invalido")).thenReturn(Optional.empty());

        assertThrows(CodigoInvalidoException.class,
                () -> service.unirseApuesta("codigo-invalido", 1L));
    }

    @Test
    void unirseApuesta_usuarioYaEnPolla_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Participacion participacion = crearParticipacion(1L, usuario, apuesta);

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(apuestaRepository.findByCodigoInvitacion("codigo-1")).thenReturn(Optional.of(apuesta));
        when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));

        assertThrows(UsuarioYaEnApuestaException.class,
                () -> service.unirseApuesta("codigo-1", 1L));
    }

    // ── CERRAR APUESTA ────────────────────────────────────────────────────

    @Test
    void cerrarApuesta_apuestaAbierta_cierraCorrectamente() {
        Usuario creador = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", creador);

        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
        when(apuestaRepository.save(any(Apuesta.class))).thenReturn(apuesta);

        ApuestaDTO resultado = service.cerrarApuesta(1L);

        assertNotNull(resultado);
        assertEquals("CERRADA", apuesta.getEstado());
        verify(apuestaRepository).save(apuesta);
    }

    @Test
void cerrarApuesta_apuestaYaCerrada_lanzaExcepcion() {
    Usuario creador = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "CERRADA", creador);

    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));

    assertThrows(ApuestaCerradaException.class,  // ← correcto
            () -> service.cerrarApuesta(1L));
}

    @Test
    void cerrarApuesta_noExistente_lanzaExcepcion() {
        when(apuestaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ApuestaNotFoundException.class,
                () -> service.cerrarApuesta(99L));
    }

    // ── OBTENER APUESTA ───────────────────────────────────────────────────

    @Test
    void obtenerApuesta_existente_retornaDTO() {
        Usuario creador = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", creador);

        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));

        ApuestaDTO resultado = service.obtenerApuesta(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
    }

    @Test
    void obtenerApuesta_noExistente_lanzaExcepcion() {
        when(apuestaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ApuestaNotFoundException.class,
                () -> service.obtenerApuesta(99L));
    }

    // ── REGISTRAR PRONOSTICO ──────────────────────────────────────────────

    @Test
    void registrarPronostico_apuestaAbierta_retornaDTO() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Participacion participacion = crearParticipacion(1L, usuario, apuesta);
        Partido partido = crearPartido(1L);
        Pronostico pronostico = new Pronostico();
        pronostico.setId(1L);
        pronostico.setResultadoPronosticado("LOCAL");
        pronostico.setGolesLocalPronosticados(2);
        pronostico.setGolesVisitantePronosticados(1);
        pronostico.setUsuario(usuario);
        pronostico.setApuesta(apuesta);
        pronostico.setPartido(partido);
        pronostico.setPuntosObtenidos(0);

        PronosticoRequestDTO dto = new PronosticoRequestDTO();
        dto.setUsuarioId(1L);
        dto.setApuestaId(1L);
        dto.setPartidoId(1L);
        dto.setResultadoPronosticado("LOCAL");
        dto.setGolesLocalPronosticados(2);
        dto.setGolesVisitantePronosticados(1);

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
        when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
        when(partidoService.obtenerPartidoEntidadPorId(1L)).thenReturn(partido);
        when(pronosticoRepository.save(any(Pronostico.class))).thenReturn(pronostico);

        PronosticoDTO resultado = service.registrarPronostico(dto);

        assertNotNull(resultado);
        verify(pronosticoRepository).save(any(Pronostico.class));
    }

    @Test
    void registrarPronostico_apuestaCerrada_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "CERRADA", usuario);

        PronosticoRequestDTO dto = new PronosticoRequestDTO();
        dto.setUsuarioId(1L);
        dto.setApuestaId(1L);
        dto.setPartidoId(1L);

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));

        assertThrows(ApuestaCerradaException.class,
                () -> service.registrarPronostico(dto));
    }

    @Test
    void registrarPronostico_usuarioNoEnPolla_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);

        PronosticoRequestDTO dto = new PronosticoRequestDTO();
        dto.setUsuarioId(1L);
        dto.setApuestaId(1L);
        dto.setPartidoId(1L);

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
        when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ParticipacionNotFoundException.class,
                () -> service.registrarPronostico(dto));
    }

    // ── OBTENER RANKING ───────────────────────────────────────────────────

    @Test
    void obtenerRanking_conParticipantes_retornaLista() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "CERRADA", usuario);
        Participacion participacion = crearParticipacion(1L, usuario, apuesta);
        participacion.setPuntos(10);

        when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L))
                .thenReturn(List.of(participacion));

        List<ParticipacionDTO> resultado = service.obtenerRanking(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(10, resultado.get(0).getPuntos());
    }

    // ── LISTAR APUESTAS POR USUARIO ───────────────────────────────────────

    @Test
    void listarApuestasPorUsuario_conApuestas_retornaLista() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Participacion participacion = crearParticipacion(1L, usuario, apuesta);

        when(participacionRepository.findByUsuarioId(1L)).thenReturn(List.of(participacion));

        var resultado = service.listarApuestasPorUsuario(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    // ── ELIMINAR APUESTA ──────────────────────────────────────────────────

    @Test
    void eliminarApuesta_existente_eliminaCorrectamente() {
        Usuario creador = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "CERRADA", creador);

        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
        doNothing().when(pronosticoRepository).deleteByApuestaId(1L);
        doNothing().when(participacionRepository).deleteByApuestaId(1L);
        doNothing().when(apuestaRepository).delete(apuesta);

        service.eliminarApuesta(1L);

        verify(pronosticoRepository).deleteByApuestaId(1L);
        verify(participacionRepository).deleteByApuestaId(1L);
        verify(apuestaRepository).delete(apuesta);
    }

    @Test
    void eliminarApuesta_noExistente_lanzaExcepcion() {
        when(apuestaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ApuestaNotFoundException.class,
                () -> service.eliminarApuesta(99L));
    }

    // ── LISTAR TODAS ──────────────────────────────────────────────────────

    @Test
    void listarTodas_conApuestas_retornaLista() {
        Usuario creador = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", creador);

        when(apuestaRepository.findAll()).thenReturn(List.of(apuesta));

        var resultado = service.listarTodas();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void listarTodas_sinApuestas_retornaListaVacia() {
        when(apuestaRepository.findAll()).thenReturn(List.of());

        var resultado = service.listarTodas();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }
}
