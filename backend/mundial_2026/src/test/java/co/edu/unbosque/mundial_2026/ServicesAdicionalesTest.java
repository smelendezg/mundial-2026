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

import co.edu.unbosque.mundial_2026.dto.PronosticoDTO;
import co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO;
import co.edu.unbosque.mundial_2026.entity.*;
import co.edu.unbosque.mundial_2026.exception.*;
import co.edu.unbosque.mundial_2026.repository.*;
import co.edu.unbosque.mundial_2026.service.*;

@ExtendWith(MockitoExtension.class)
class ServicesAdicionalesTest {

    // ── Mocks compartidos ─────────────────────────────────────────────────

    @Mock private ApuestaRepository apuestaRepository;
    @Mock private PronosticoRepository pronosticoRepository;
    @Mock private ParticipacionRepository participacionRepository;
    @Mock private UsuarioService usuarioService;
    @Mock private PartidoService partidoService;
    @Mock private OrdenRepository ordenRepository;
    @Mock private ItemOrdenRepository itemOrdenRepository;
    @Mock private ProductoService productoService;
    @Mock private MetodoPagoService metodoPagoService;
    @Mock private EventoAuditoriaService auditoriaService;
    @Mock private EntradaRepository entradaRepository;

    @InjectMocks private ApuestaServiceImpl apuestaService;
    @InjectMocks private OrdenServiceImpl ordenService;
    @InjectMocks private EntradaServiceImpl entradaService;

    // ── Helpers ───────────────────────────────────────────────────────────

    private Usuario crearUsuario(Long id) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario("user" + id + "@test.com");
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");
        u.setRol(rol);
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

    private Partido crearPartido(Long id, Integer golesLocal, Integer golesVisitante) {
        Partido p = new Partido();
        p.setId(id);
        p.setSeleccionLocal("Colombia");
        p.setSeleccionVisitante("Brazil");
        p.setGolesLocal(golesLocal);
        p.setGolesVisitante(golesVisitante);
        p.setFecha(LocalDateTime.now().minusDays(1));
        p.setRonda("Group Stage - 1");
        return p;
    }

    private Pronostico crearPronostico(Long id, Usuario usuario, Apuesta apuesta, Partido partido,
            String resultado, int golesLocal, int golesVisitante) {
        Pronostico p = new Pronostico();
        p.setId(id);
        p.setUsuario(usuario);
        p.setApuesta(apuesta);
        p.setPartido(partido);
        p.setResultadoPronosticado(resultado);
        p.setGolesLocalPronosticados(golesLocal);
        p.setGolesVisitantePronosticados(golesVisitante);
        p.setPuntosObtenidos(0);
        return p;
    }

    private Participacion crearParticipacion(Long id, Usuario usuario, Apuesta apuesta) {
        Participacion p = new Participacion();
        p.setId(id);
        p.setUsuario(usuario);
        p.setApuesta(apuesta);
        p.setPuntos(0);
        return p;
    }

    private Orden crearOrden(Long id, String estado, Usuario usuario) {
        Orden o = new Orden();
        o.setId(id);
        o.setEstado(estado);
        o.setTotal(100.0);
        o.setFechaCreacion(LocalDateTime.now());
        o.setUsuario(usuario);
        return o;
    }

    private Producto crearProducto(Long id, int stock) {
        Producto p = new Producto();
        p.setId(id);
        p.setNombre("Camiseta");
        p.setPrecio(50.0);
        p.setStock(stock);
        p.setActivo(true);
        return p;
    }

 

    private Entrada crearEntrada(Long id, Usuario usuario, Partido partido, String estado, int cantidad) {
        Entrada e = new Entrada();
        e.setId(id);
        e.setUsuario(usuario);
        e.setPartido(partido);
        e.setEstado(estado);
        e.setCantidad(cantidad);
        e.setPrecio(50000.0 * cantidad);
        e.setFechaCompra(LocalDateTime.now());
        e.setTtlReserva(LocalDateTime.now().plusMinutes(15));
        return e;
    }

    // ── ApuestaServiceImpl — cobertura adicional ──────────────────────────

    @Test
    void calcularPuntos_apuestaCerrada_calculaCorrectamente() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "CERRADA", usuario);
        Partido partido = crearPartido(1L, 2, 1);
        Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 2, 1);
        Participacion participacion = crearParticipacion(1L, usuario, apuesta);

        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
        when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
        when(participacionRepository.save(any())).thenReturn(participacion);
        when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
        when(partidoService.sincronizarPorFechaYLiga(any(), anyInt(), anyInt())).thenReturn(1);
        when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
        when(pronosticoRepository.save(any())).thenReturn(pronostico);
        when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

        List<PronosticoDTO> resultado = apuestaService.calcularPuntos(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void calcularPuntos_apuestaAbierta_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);

        when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));

        assertThrows(EstadoInvalidoException.class,
                () -> apuestaService.calcularPuntos(1L));
    }

    @Test
    void editarPronostico_apuestaAbierta_actualizaCorrectamente() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Partido partido = crearPartido(1L, null, null);
        Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 1, 0);

        PronosticoRequestDTO dto = new PronosticoRequestDTO();
        dto.setResultadoPronosticado("VISITANTE");
        dto.setGolesLocalPronosticados(0);
        dto.setGolesVisitantePronosticados(2);

        when(pronosticoRepository.findById(1L)).thenReturn(Optional.of(pronostico));
        when(pronosticoRepository.save(any())).thenReturn(pronostico);

        PronosticoDTO resultado = apuestaService.editarPronostico(1L, dto);

        assertNotNull(resultado);
    }

    @Test
    void eliminarPronostico_apuestaAbierta_eliminaCorrectamente() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Partido partido = crearPartido(1L, null, null);
        Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 1, 0);

        when(pronosticoRepository.findById(1L)).thenReturn(Optional.of(pronostico));
        doNothing().when(pronosticoRepository).delete(pronostico);

        apuestaService.eliminarPronostico(1L);

        verify(pronosticoRepository).delete(pronostico);
    }

    @Test
    void misPronosticos_retornaLista() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Partido partido = crearPartido(1L, null, null);
        Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 1, 0);

        when(pronosticoRepository.findByApuestaIdAndUsuarioId(1L, 1L)).thenReturn(List.of(pronostico));

        var resultado = apuestaService.misPronosticos(1L, 1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void listarParticipantes_retornaLista() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Participacion participacion = crearParticipacion(1L, usuario, apuesta);

        when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));

        var resultado = apuestaService.listarParticipantes(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void verificarPronostico_existente_retornaDTO() {
        Usuario usuario = crearUsuario(1L);
        Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
        Partido partido = crearPartido(1L, null, null);
        Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 1, 0);

        when(pronosticoRepository.findById(1L)).thenReturn(Optional.of(pronostico));

        PronosticoDTO resultado = apuestaService.verificarPronostico(1L);

        assertNotNull(resultado);
    }

    @Test
    void verificarPronostico_noExistente_lanzaExcepcion() {
        when(pronosticoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PronosticoNotFoundException.class,
                () -> apuestaService.verificarPronostico(99L));
    }

    // ── OrdenServiceImpl — cobertura adicional ────────────────────────────

    @Test
    void agregarItem_productoInactivo_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 10);
        producto.setActivo(false);

        co.edu.unbosque.mundial_2026.dto.request.AgregarItemDTO dto =
                new co.edu.unbosque.mundial_2026.dto.request.AgregarItemDTO();
        dto.setProductoId(1L);
        dto.setCantidad(2);

        when(usuarioService.obtenerEntidadPorCorreo("user1@test.com")).thenReturn(usuario);
        when(productoService.obtenerEntidadPorId(1L)).thenReturn(producto);

        assertThrows(ProductoNotFoundException.class,
                () -> ordenService.agregarItem("user1@test.com", dto));
    }

    @Test
    void eliminarItem_itemNoExistente_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Orden orden = crearOrden(1L, "PENDIENTE", usuario);

        when(usuarioService.obtenerEntidadPorCorreo("user1@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
        when(itemOrdenRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(co.edu.unbosque.mundial_2026.exception.ItemNotFoundException.class,
                () -> ordenService.eliminarItem("user1@test.com", 99L));
    }

    // ── EntradaServiceImpl — cobertura adicional ──────────────────────────

    @Test
    void transferirEntrada_entradaDeOtroUsuario_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Usuario otroUsuario = crearUsuario(2L);
        Partido partido = crearPartido(1L, null, null);
        Entrada entrada = crearEntrada(1L, otroUsuario, partido, "PAGADA", 2);

        co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO dto =
                new co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO();
        dto.setCorreoDestino("destino@test.com");

        when(usuarioService.obtenerEntidadPorCorreo("user1@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));

        assertThrows(EstadoInvalidoException.class,
                () -> entradaService.transferirEntrada(1L, dto, "user1@test.com"));
    }

    @Test
    void reembolsarEntrada_entradaDeOtroUsuario_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Usuario otroUsuario = crearUsuario(2L);
        Partido partido = crearPartido(1L, null, null);
        Entrada entrada = crearEntrada(1L, otroUsuario, partido, "PAGADA", 2);

        when(usuarioService.obtenerEntidadPorCorreo("user1@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));

        assertThrows(EstadoInvalidoException.class,
                () -> entradaService.reembolsarEntrada("user1@test.com", 1L));
    }

    @Test
    void reembolsarEntrada_entradaNoEsPagada_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Partido partido = crearPartido(1L, null, null);
        Entrada entrada = crearEntrada(1L, usuario, partido, "RESERVADA", 2);

        when(usuarioService.obtenerEntidadPorCorreo("user1@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));

        assertThrows(EstadoInvalidoException.class,
                () -> entradaService.reembolsarEntrada("user1@test.com", 1L));
    }

    @Test
    void listarPartidosConCapacidad_retornaLista() {
        when(partidoService.listarPartidosConCapacidad()).thenReturn(List.of());

        var resultado = entradaService.listarPartidosConCapacidad();

        assertNotNull(resultado);
    }
    @Test
void determinarResultado_visitanteGana_retornaVisitante() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "CERRADA", usuario);
    Partido partido = crearPartido(1L, 0, 2); // visitante gana

    Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "VISITANTE", 0, 2);
    Participacion participacion = crearParticipacion(1L, usuario, apuesta);

    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
    when(participacionRepository.save(any())).thenReturn(participacion);
    when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
    when(partidoService.sincronizarPorFechaYLiga(any(), anyInt(), anyInt())).thenReturn(1);
    when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
    when(pronosticoRepository.save(any())).thenReturn(pronostico);
    when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

    List<PronosticoDTO> resultado = apuestaService.calcularPuntos(1L);
    assertNotNull(resultado);
}

@Test
void determinarResultado_empate_retornaEmpate() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "CERRADA", usuario);
    Partido partido = crearPartido(1L, 1, 1); // empate

    Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "EMPATE", 1, 1);
    Participacion participacion = crearParticipacion(1L, usuario, apuesta);

    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
    when(participacionRepository.save(any())).thenReturn(participacion);
    when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
    when(partidoService.sincronizarPorFechaYLiga(any(), anyInt(), anyInt())).thenReturn(1);
    when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
    when(pronosticoRepository.save(any())).thenReturn(pronostico);
    when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

    List<PronosticoDTO> resultado = apuestaService.calcularPuntos(1L);
    assertNotNull(resultado);
}
@Test
void calcularPuntosAutomatico_sinApuestas_noHaceNada() {
    when(apuestaRepository.findByEstado("CERRADA")).thenReturn(List.of());
    apuestaService.calcularPuntosAutomatico();
    verify(apuestaRepository).findByEstado("CERRADA");
}

@Test
void cerrarApuestasVencidas_sinApuestas_noHaceNada() {
    when(apuestaRepository.findByEstadoAndFechaCierreBefore(
            eq("ABIERTA"), any())).thenReturn(List.of());
    apuestaService.cerrarApuestasVencidas();
    verify(apuestaRepository).findByEstadoAndFechaCierreBefore(eq("ABIERTA"), any());
}
@Test
void calcularPuntosParciales_conPartidoSinResultado_ignoraPartido() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
    Partido partido = crearPartido(1L, null, null); // sin resultado
    Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 1, 0);
    Participacion participacion = crearParticipacion(1L, usuario, apuesta);

    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
    when(participacionRepository.save(any())).thenReturn(participacion);
    when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
    when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

    List<PronosticoDTO> resultado = apuestaService.calcularPuntosParciales(1L);

    assertNotNull(resultado);
    assertTrue(resultado.isEmpty());
}

@Test
void calcularPuntosParciales_conPartidoConResultado_calculaPuntos() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
    Partido partido = crearPartido(1L, 2, 1); // con resultado
    Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 2, 1);
    Participacion participacion = crearParticipacion(1L, usuario, apuesta);

    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
    when(participacionRepository.save(any())).thenReturn(participacion);
    when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
    when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
    when(pronosticoRepository.save(any())).thenReturn(pronostico);
    when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

    List<PronosticoDTO> resultado = apuestaService.calcularPuntosParciales(1L);

    assertNotNull(resultado);
    assertEquals(1, resultado.size());
}
@Test
void calcularPuntosAutomatico_conApuestasCerradas_llamaCalcularPuntos() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "CERRADA", usuario);
    Partido partido = crearPartido(1L, 2, 1);
    Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "LOCAL", 2, 1);
    Participacion participacion = crearParticipacion(1L, usuario, apuesta);

    when(apuestaRepository.findByEstado("CERRADA")).thenReturn(List.of(apuesta));
    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
    when(participacionRepository.save(any())).thenReturn(participacion);
    when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
    when(partidoService.sincronizarPorFechaYLiga(any(), anyInt(), anyInt())).thenReturn(1);
    when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
    when(pronosticoRepository.save(any())).thenReturn(pronostico);
    when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

    apuestaService.calcularPuntosAutomatico();

    verify(apuestaRepository).findByEstado("CERRADA");
    verify(apuestaRepository).findById(1L);
}

@Test
void cerrarApuestasVencidas_conApuestasAbiertas_cierraCorrectamente() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);

    when(apuestaRepository.findByEstadoAndFechaCierreBefore(eq("ABIERTA"), any()))
            .thenReturn(List.of(apuesta));
    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(apuestaRepository.save(any())).thenReturn(apuesta);

    apuestaService.cerrarApuestasVencidas();

    verify(apuestaRepository).findByEstadoAndFechaCierreBefore(eq("ABIERTA"), any());
    assertEquals("CERRADA", apuesta.getEstado());
}
@Test
void calcularPuntosParciales_visitanteGana_calculaPuntos() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
    Partido partido = crearPartido(1L, 0, 2); // visitante gana
    Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "VISITANTE", 0, 2);
    Participacion participacion = crearParticipacion(1L, usuario, apuesta);

    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
    when(participacionRepository.save(any())).thenReturn(participacion);
    when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
    when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
    when(pronosticoRepository.save(any())).thenReturn(pronostico);
    when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

    List<PronosticoDTO> resultado = apuestaService.calcularPuntosParciales(1L);
    assertNotNull(resultado);
    assertEquals(1, resultado.size());
}

@Test
void calcularPuntosParciales_empate_calculaPuntos() {
    Usuario usuario = crearUsuario(1L);
    Apuesta apuesta = crearApuesta(1L, "ABIERTA", usuario);
    Partido partido = crearPartido(1L, 1, 1); // empate
    Pronostico pronostico = crearPronostico(1L, usuario, apuesta, partido, "EMPATE", 1, 1);
    Participacion participacion = crearParticipacion(1L, usuario, apuesta);

    when(apuestaRepository.findById(1L)).thenReturn(Optional.of(apuesta));
    when(participacionRepository.findByApuestaId(1L)).thenReturn(List.of(participacion));
    when(participacionRepository.save(any())).thenReturn(participacion);
    when(pronosticoRepository.findByApuestaId(1L)).thenReturn(List.of(pronostico));
    when(participacionRepository.findByUsuarioIdAndApuestaId(1L, 1L)).thenReturn(Optional.of(participacion));
    when(pronosticoRepository.save(any())).thenReturn(pronostico);
    when(participacionRepository.findByApuestaIdOrderByPuntosDesc(1L)).thenReturn(List.of(participacion));

    List<PronosticoDTO> resultado = apuestaService.calcularPuntosParciales(1L);
    assertNotNull(resultado);
    assertEquals(1, resultado.size());
}
}
