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

import co.edu.unbosque.mundial_2026.dto.request.EntradaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.EntradaResponseDTO;
import co.edu.unbosque.mundial_2026.entity.*;
import co.edu.unbosque.mundial_2026.exception.*;
import co.edu.unbosque.mundial_2026.repository.EntradaRepository;
import co.edu.unbosque.mundial_2026.service.*;

@ExtendWith(MockitoExtension.class)
class EntradaServiceImplTest {

    @Mock private EntradaRepository entradaRepository;
    @Mock private UsuarioService usuarioService;
    @Mock private PartidoService partidoService;
    @Mock private EventoAuditoriaService auditoriaService;

    @InjectMocks private EntradaServiceImpl service;

    private Usuario crearUsuario(Long id, String correo) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario(correo);
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");
        u.setRol(rol);
        return u;
    }

    private Partido crearPartido(Long id, int capacidad) {
        Partido p = new Partido();
        p.setId(id);
        p.setSeleccionLocal("Colombia");
        p.setSeleccionVisitante("Brazil");
        p.setRonda("Group Stage - 1");
        p.setCapacidadDisponible(capacidad);
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

    // ── RESERVAR ENTRADA ──────────────────────────────────────────────────

    @Test
    void reservarEntrada_datosValidos_retornaDTO() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuario, partido, "RESERVADA", 2);

        EntradaRequestDTO dto = new EntradaRequestDTO();
        dto.setPartidoId(1L);
        dto.setCantidad(2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(partidoService.obtenerPartidoEntidadPorId(1L)).thenReturn(partido);
        when(entradaRepository.findByUsuarioIdAndFechaCompraBetween(eq(1L), any(), any()))
                .thenReturn(List.of());
        when(entradaRepository.save(any(Entrada.class))).thenReturn(entrada);
        doNothing().when(partidoService).actualizarCapacidad(anyLong(), anyInt());
        doNothing().when(auditoriaService).registrar(any(), any(), any(), any(), any());

        EntradaResponseDTO resultado = service.reservarEntrada("user@test.com", dto);

        assertNotNull(resultado);
        verify(entradaRepository).save(any(Entrada.class));
        verify(partidoService).actualizarCapacidad(1L, -2);
    }

    @Test
    void reservarEntrada_sinCupo_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 1);

        EntradaRequestDTO dto = new EntradaRequestDTO();
        dto.setPartidoId(1L);
        dto.setCantidad(5);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(partidoService.obtenerPartidoEntidadPorId(1L)).thenReturn(partido);

        assertThrows(CupoNoDisponibleException.class,
                () -> service.reservarEntrada("user@test.com", dto));
    }

    @Test
    void reservarEntrada_superaLimitePorTransaccion_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);

        EntradaRequestDTO dto = new EntradaRequestDTO();
        dto.setPartidoId(1L);
        dto.setCantidad(5);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(partidoService.obtenerPartidoEntidadPorId(1L)).thenReturn(partido);

        assertThrows(LimiteSuperadoException.class,
                () -> service.reservarEntrada("user@test.com", dto));
    }

    @Test
    void reservarEntrada_superaLimiteDiario_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entradaExistente = crearEntrada(1L, usuario, partido, "PAGADA", 4);
        entradaExistente.setCantidad(10);

        EntradaRequestDTO dto = new EntradaRequestDTO();
        dto.setPartidoId(1L);
        dto.setCantidad(3);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(partidoService.obtenerPartidoEntidadPorId(1L)).thenReturn(partido);
        when(entradaRepository.findByUsuarioIdAndFechaCompraBetween(eq(1L), any(), any()))
                .thenReturn(List.of(entradaExistente));

        assertThrows(LimiteSuperadoException.class,
                () -> service.reservarEntrada("user@test.com", dto));
    }

    // ── CANCELAR RESERVA ──────────────────────────────────────────────────

    @Test
    void cancelarReserva_entradaReservada_cancelaCorrectamente() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuario, partido, "RESERVADA", 2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));
        when(entradaRepository.save(any(Entrada.class))).thenReturn(entrada);
        doNothing().when(partidoService).actualizarCapacidad(anyLong(), anyInt());
        doNothing().when(auditoriaService).registrar(any(), any(), any(), any(), any());

        EntradaResponseDTO resultado = service.cancelarReserva("user@test.com", 1L);

        assertNotNull(resultado);
        assertEquals("CANCELADA", entrada.getEstado());
    }

    @Test
    void cancelarReserva_entradaNoEncontrada_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com");

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntradaNotFoundException.class,
                () -> service.cancelarReserva("user@test.com", 99L));
    }

    @Test
    void cancelarReserva_entradaDeOtroUsuario_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Usuario otroUsuario = crearUsuario(2L, "otro@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, otroUsuario, partido, "RESERVADA", 2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));

        assertThrows(EstadoInvalidoException.class,
                () -> service.cancelarReserva("user@test.com", 1L));
    }

    @Test
    void cancelarReserva_entradaYaPagada_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuario, partido, "PAGADA", 2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));

        assertThrows(EstadoInvalidoException.class,
                () -> service.cancelarReserva("user@test.com", 1L));
    }

    // ── TRANSFERIR ENTRADA ────────────────────────────────────────────────

    @Test
    void transferirEntrada_entradaPagada_transfierCorrectamente() {
        Usuario usuarioOrigen = crearUsuario(1L, "user@test.com");
        Usuario usuarioDestino = crearUsuario(2L, "destino@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuarioOrigen, partido, "PAGADA", 2);

        TransferenciaRequestDTO dto = new TransferenciaRequestDTO();
        dto.setCorreoDestino("destino@test.com");

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuarioOrigen);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));
        when(entradaRepository.findByUsuarioIdAndFechaCompraBetween(eq(1L), any(), any()))
                .thenReturn(List.of());
        when(usuarioService.obtenerEntidadPorCorreo("destino@test.com")).thenReturn(usuarioDestino);
        when(entradaRepository.save(any(Entrada.class))).thenReturn(entrada);
        doNothing().when(auditoriaService).registrar(any(), any(), any(), any(), any());

        EntradaResponseDTO resultado = service.transferirEntrada(1L, dto, "user@test.com");

        assertNotNull(resultado);
        verify(entradaRepository, times(2)).save(any(Entrada.class));
    }

    @Test
    void transferirEntrada_entradaNoEsPagada_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuario, partido, "RESERVADA", 2);

        TransferenciaRequestDTO dto = new TransferenciaRequestDTO();
        dto.setCorreoDestino("destino@test.com");

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));

        assertThrows(EstadoInvalidoException.class,
                () -> service.transferirEntrada(1L, dto, "user@test.com"));
    }

    // ── LISTAR ENTRADAS ───────────────────────────────────────────────────

    @Test
    void listarEntradasUsuario_conEntradas_retornaLista() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuario, partido, "PAGADA", 2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(entradaRepository.findByUsuarioId(1L)).thenReturn(List.of(entrada));

        var resultado = service.listarEntradasUsuario("user@test.com");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void listarEntradasUsuario_sinEntradas_retornaListaVacia() {
        Usuario usuario = crearUsuario(1L, "user@test.com");

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(entradaRepository.findByUsuarioId(1L)).thenReturn(List.of());

        var resultado = service.listarEntradasUsuario("user@test.com");

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    // ── OBTENER ENTRADA ───────────────────────────────────────────────────

    @Test
    void obtenerEntrada_existente_retornaDTO() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuario, partido, "PAGADA", 2);

        when(entradaRepository.findById(1L)).thenReturn(Optional.of(entrada));

        EntradaResponseDTO resultado = service.obtenerEntrada(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
    }

    @Test
    void obtenerEntrada_noExistente_lanzaExcepcion() {
        when(entradaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.obtenerEntrada(99L));
    }

    // ── EXPIRAR RESERVAS ──────────────────────────────────────────────────

    @Test
    void expirarReservasVencidas_conVencidas_expiraYRestauraCapacidad() {
        Usuario usuario = crearUsuario(1L, "user@test.com");
        Partido partido = crearPartido(1L, 100);
        Entrada entrada = crearEntrada(1L, usuario, partido, "RESERVADA", 2);
        entrada.setTtlReserva(LocalDateTime.now().minusMinutes(1));

        when(entradaRepository.findByEstadoAndTtlReservaLessThan(eq("RESERVADA"), any()))
                .thenReturn(List.of(entrada));
        when(entradaRepository.save(any(Entrada.class))).thenReturn(entrada);
        doNothing().when(partidoService).actualizarCapacidad(anyLong(), anyInt());
        doNothing().when(auditoriaService).registrar(any(), any(), any(), any(), any());

        service.expirarReservasVencidas();

        assertEquals("EXPIRADA", entrada.getEstado());
        verify(partidoService).actualizarCapacidad(1L, 2);
    }

    @Test
    void expirarReservasVencidas_sinVencidas_noHaceNada() {
        when(entradaRepository.findByEstadoAndTtlReservaLessThan(eq("RESERVADA"), any()))
                .thenReturn(List.of());

        service.expirarReservasVencidas();

        verify(entradaRepository, never()).save(any());
    }
}
