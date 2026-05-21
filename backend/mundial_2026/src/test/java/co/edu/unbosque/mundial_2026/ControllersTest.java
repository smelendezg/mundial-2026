package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import co.edu.unbosque.mundial_2026.controller.ApuestaRestController;
import co.edu.unbosque.mundial_2026.controller.CategoriaController;
import co.edu.unbosque.mundial_2026.controller.EntradaRestController;
import co.edu.unbosque.mundial_2026.controller.EventoAuditoriaController;
import co.edu.unbosque.mundial_2026.controller.MetodoPagoController;
import co.edu.unbosque.mundial_2026.controller.NotificacionController;
import co.edu.unbosque.mundial_2026.controller.OrdenController;
import co.edu.unbosque.mundial_2026.controller.PartidoController;
import co.edu.unbosque.mundial_2026.controller.ProductoController;
import co.edu.unbosque.mundial_2026.controller.UsuarioRestController;
import co.edu.unbosque.mundial_2026.dto.ApuestaDTO;
import co.edu.unbosque.mundial_2026.dto.PronosticoDTO;
import co.edu.unbosque.mundial_2026.dto.response.EntradaResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.OrdenResponseDTO;
import co.edu.unbosque.mundial_2026.security.TokenBlacklist;
import co.edu.unbosque.mundial_2026.service.ApuestaService;
import co.edu.unbosque.mundial_2026.service.CategoriaService;
import co.edu.unbosque.mundial_2026.service.EntradaService;
import co.edu.unbosque.mundial_2026.service.EventoAuditoriaService;
import co.edu.unbosque.mundial_2026.service.MetodoPagoService;
import co.edu.unbosque.mundial_2026.service.NotificacionService;
import co.edu.unbosque.mundial_2026.service.OrdenService;
import co.edu.unbosque.mundial_2026.service.PartidoService;
import co.edu.unbosque.mundial_2026.service.ProductoService;
import co.edu.unbosque.mundial_2026.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
class ControllersTest {

    @Mock private ApuestaService apuestaService;
    @InjectMocks private ApuestaRestController apuestaController;

    @Mock private EntradaService entradaService;
    @InjectMocks private EntradaRestController entradaController;

    @Mock private OrdenService ordenService;
    @InjectMocks private OrdenController ordenController;

    @Mock private PartidoService partidoService;
    @InjectMocks private PartidoController partidoController;

    @Mock private CategoriaService categoriaService;
    @InjectMocks private CategoriaController categoriaController;

    @Mock private EventoAuditoriaService eventoService;
    @InjectMocks private EventoAuditoriaController eventoController;

    @Mock private MetodoPagoService metodoPagoService;
    @InjectMocks private MetodoPagoController metodoPagoController;

    @Mock private ProductoService productoService;
    @InjectMocks private ProductoController productoController;

    @Mock private NotificacionService notificacionService;
    @Mock private UsuarioService usuarioService;
    @InjectMocks private NotificacionController notificacionController;

    @Mock private TokenBlacklist tokenBlacklist;
    @InjectMocks private UsuarioRestController usuarioController;

    @Test
    void apuesta_listarPorUsuario_retornaOk() {
        when(apuestaService.listarApuestasPorUsuario(1L)).thenReturn(List.of());
        ResponseEntity<?> res = apuestaController.listarApuestasPorUsuario(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void apuesta_obtenerApuesta_retornaOk() {
        when(apuestaService.obtenerApuesta(1L)).thenReturn(new ApuestaDTO());
        ResponseEntity<?> res = apuestaController.obtenerApuesta(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void apuesta_obtenerRanking_retornaOk() {
        when(apuestaService.obtenerRanking(1L)).thenReturn(List.of());
        ResponseEntity<?> res = apuestaController.obtenerRanking(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void apuesta_listarParticipantes_retornaOk() {
        when(apuestaService.listarParticipantes(1L)).thenReturn(List.of());
        ResponseEntity<?> res = apuestaController.listarParticipantes(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void apuesta_verificarPronostico_retornaOk() {
        when(apuestaService.verificarPronostico(1L)).thenReturn(new PronosticoDTO());
        ResponseEntity<?> res = apuestaController.verificarPronostico(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void apuesta_misPronosticos_retornaOk() {
        when(apuestaService.misPronosticos(1L, 1L)).thenReturn(List.of());
        ResponseEntity<?> res = apuestaController.misPronosticos(1L, 1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void apuesta_calcularPuntosParciales_retornaOk() {
        when(apuestaService.calcularPuntosParciales(1L)).thenReturn(List.of());
        ResponseEntity<?> res = apuestaController.calcularPuntosParciales(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void entrada_listarPartidos_retornaOk() {
        when(entradaService.listarPartidosConCapacidad()).thenReturn(List.of());
        ResponseEntity<?> res = entradaController.listarPartidos();
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void entrada_obtener_retornaOk() {
        when(entradaService.obtenerEntrada(1L)).thenReturn(new EntradaResponseDTO());
        ResponseEntity<?> res = entradaController.obtener(1L);
        assertEquals(200, res.getStatusCode().value());
    }

   

    @Test
    void entrada_pagar_retornaOk() {
        when(entradaService.confirmarPago(1L, "ref123")).thenReturn(new EntradaResponseDTO());
        ResponseEntity<?> res = entradaController.pagar(1L, "ref123");
        assertEquals(200, res.getStatusCode().value());
    }

    

   
    
   
    @Test
    void partido_catalogo_selecciones_retornaOk() {
        when(partidoService.obtenerCatalogoSelecciones()).thenReturn(List.of());
        ResponseEntity<?> res = partidoController.obtenerCatalogoSelecciones();
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void partido_listarDesdeBD_retornaOk() {
        when(partidoService.listarDesdeBD()).thenReturn(List.of());
        ResponseEntity<?> res = partidoController.listarDesdeBD();
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void categoria_listar_retornaOk() {
        when(categoriaService.listar()).thenReturn(List.of());
        ResponseEntity<?> res = categoriaController.listar();
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void auditoria_buscarPorUsuario_retornaOk() {
        when(eventoService.buscarPorUsuario(1L)).thenReturn(List.of());
        ResponseEntity<?> res = eventoController.buscarPorUsuario(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void auditoria_buscarPorTipo_retornaOk() {
        when(eventoService.buscarPorTipo("LOGIN")).thenReturn(List.of());
        ResponseEntity<?> res = eventoController.buscarPorTipo("LOGIN");
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void auditoria_buscarPorCorrelacion_retornaOk() {
        when(eventoService.buscarPorCorrelacion("corr-1")).thenReturn(List.of());
        ResponseEntity<?> res = eventoController.buscarPorCorrelacion("corr-1");
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void auditoria_buscarPorEntidad_retornaOk() {
        when(eventoService.buscarPorEntidad("USUARIO")).thenReturn(List.of());
        ResponseEntity<?> res = eventoController.buscarPorEntidad("USUARIO");
        assertEquals(200, res.getStatusCode().value());
    }


    
    @Test
    void producto_listar_sinCategoria_retornaOk() {
        when(productoService.listarTodos()).thenReturn(List.of());
        ResponseEntity<?> res = productoController.listar(null);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void producto_listar_conCategoria_retornaOk() {
        when(productoService.listarPorCategoria(1L)).thenReturn(List.of());
        ResponseEntity<?> res = productoController.listar(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void producto_obtenerPorId_retornaOk() {
        when(productoService.obtenerPorId(1L))
            .thenReturn(new co.edu.unbosque.mundial_2026.dto.response.ProductoResponseDTO());
        ResponseEntity<?> res = productoController.obtenerPorId(1L);
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void notificacion_marcarLeida_retornaNoContent() {
        doNothing().when(notificacionService).marcarLeida(1L);
        ResponseEntity<?> res = notificacionController.marcarLeida(1L);
        assertEquals(204, res.getStatusCode().value());
    }

    @Test
    void usuario_registrar_retornaCreated() {
        co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO dto =
            new co.edu.unbosque.mundial_2026.dto.request.UsuarioRequestDTO();
        co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO response =
            new co.edu.unbosque.mundial_2026.dto.response.UsuarioResponseDTO();
        when(usuarioService.registrarUsuario(dto)).thenReturn(response);
        ResponseEntity<?> res = usuarioController.registrarUsuario(dto);
        assertEquals(201, res.getStatusCode().value());
    }

    @Test
    void usuario_listarEstadios_retornaOk() {
        when(usuarioService.listarEstadios()).thenReturn(List.of());
        ResponseEntity<?> res = usuarioController.listarEstadios();
        assertEquals(200, res.getStatusCode().value());
    }

    @Test
    void usuario_listarCiudades_retornaOk() {
        when(usuarioService.listarCiudades()).thenReturn(List.of());
        ResponseEntity<?> res = usuarioController.listarCiudades();
        assertEquals(200, res.getStatusCode().value());
    }
    @Test
void apuesta_crearApuesta_retornaOk() {
    co.edu.unbosque.mundial_2026.dto.request.ApuestaRequestDTO dto =
        new co.edu.unbosque.mundial_2026.dto.request.ApuestaRequestDTO();
    when(apuestaService.crearApuesta(dto)).thenReturn(new ApuestaDTO());
    ResponseEntity<?> res = apuestaController.crearApuesta(dto);
    assertEquals(200, res.getStatusCode().value());
}

@Test
void apuesta_unirseApuesta_retornaOk() {
    when(apuestaService.unirseApuesta("codigo", 1L)).thenReturn(new ApuestaDTO());
    ResponseEntity<?> res = apuestaController.unirseApuesta(1L, "\"codigo\"");
    assertEquals(200, res.getStatusCode().value());
}

@Test
void apuesta_registrarPronostico_retornaOk() {
    co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO dto =
        new co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO();
    when(apuestaService.registrarPronostico(dto)).thenReturn(new PronosticoDTO());
    ResponseEntity<?> res = apuestaController.registrarPronostico(dto);
    assertEquals(200, res.getStatusCode().value());
}

@Test
void apuesta_editarPronostico_retornaOk() {
    co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO dto =
        new co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO();
    when(apuestaService.editarPronostico(1L, dto)).thenReturn(new PronosticoDTO());
    ResponseEntity<?> res = apuestaController.editarPronostico(1L, dto);
    assertEquals(200, res.getStatusCode().value());
}

@Test
void apuesta_eliminarPronostico_retornaNoContent() {
    doNothing().when(apuestaService).eliminarPronostico(1L);
    ResponseEntity<?> res = apuestaController.eliminarPronostico(1L);
    assertEquals(204, res.getStatusCode().value());
}

@Test
void entrada_listar_retornaOk() {
    when(entradaService.listarEntradasUsuario("test@test.com")).thenReturn(List.of());
    ResponseEntity<?> res = entradaController.listar("test@test.com");
    assertEquals(200, res.getStatusCode().value());
}

@Test
void entrada_cancelar_retornaOk() {
    when(entradaService.cancelarReserva("test@test.com", 1L)).thenReturn(new EntradaResponseDTO());
    ResponseEntity<?> res = entradaController.cancelar("test@test.com", 1L);
    assertEquals(200, res.getStatusCode().value());
}

@Test
void entrada_transferir_retornaOk() {
    co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO dto =
        new co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO();
    when(entradaService.transferirEntrada(1L, dto, "test@test.com"))
        .thenReturn(new EntradaResponseDTO());
    ResponseEntity<?> res = entradaController.transferir("test@test.com", 1L, dto);
    assertEquals(200, res.getStatusCode().value());
}

@Test
void entrada_reembolsar_retornaOk() {
    when(entradaService.reembolsarEntrada("test@test.com", 1L))
        .thenReturn(new EntradaResponseDTO());
    ResponseEntity<?> res = entradaController.reembolsar("test@test.com", 1L);
    assertEquals(200, res.getStatusCode().value());
}

@Test
void orden_historial_retornaOk() {
    when(ordenService.historial("test@test.com")).thenReturn(List.of());
    ResponseEntity<?> res = ordenController.historial("test@test.com");
    assertEquals(200, res.getStatusCode().value());
}

@Test
void orden_carrito_retornaOk() {
    when(ordenService.obtenerCarrito("test@test.com")).thenReturn(new OrdenResponseDTO());
    ResponseEntity<?> res = ordenController.carrito("test@test.com");
    assertEquals(200, res.getStatusCode().value());
}

@Test
void orden_cancelar_retornaOk() {
    when(ordenService.cancelarOrden("test@test.com")).thenReturn(new OrdenResponseDTO());
    ResponseEntity<?> res = ordenController.cancelar("test@test.com");
    assertEquals(200, res.getStatusCode().value());
}

@Test
void metodoPago_listar_retornaOk() {
    when(metodoPagoService.listarPorCorreo("test@test.com")).thenReturn(List.of());
    ResponseEntity<?> res = metodoPagoController.listar("test@test.com");
    assertEquals(200, res.getStatusCode().value());
}

@Test
void metodoPago_agregar_retornaOk() {
    co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO dto =
        new co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO();
    co.edu.unbosque.mundial_2026.dto.response.MetodoPagoResponseDTO response =
        new co.edu.unbosque.mundial_2026.dto.response.MetodoPagoResponseDTO();
    when(metodoPagoService.agregar("test@test.com", dto)).thenReturn(response);
    ResponseEntity<?> res = metodoPagoController.agregar("test@test.com", dto);
    assertEquals(200, res.getStatusCode().value());
}

@Test
void metodoPago_agregar_nullRetorna400() {
    co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO dto =
        new co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO();
    when(metodoPagoService.agregar("test@test.com", dto)).thenReturn(null);
    ResponseEntity<?> res = metodoPagoController.agregar("test@test.com", dto);
    assertEquals(400, res.getStatusCode().value());
}
}