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

import co.edu.unbosque.mundial_2026.dto.request.AgregarItemDTO;
import co.edu.unbosque.mundial_2026.dto.response.OrdenResponseDTO;
import co.edu.unbosque.mundial_2026.entity.*;
import co.edu.unbosque.mundial_2026.exception.OrdenNotFoundException;
import co.edu.unbosque.mundial_2026.exception.StockInsuficienteException;
import co.edu.unbosque.mundial_2026.repository.ItemOrdenRepository;
import co.edu.unbosque.mundial_2026.repository.OrdenRepository;
import co.edu.unbosque.mundial_2026.service.*;

@ExtendWith(MockitoExtension.class)
class OrdenServiceImplTest {

    @Mock private OrdenRepository ordenRepository;
    @Mock private ItemOrdenRepository itemOrdenRepository;
    @Mock private UsuarioService usuarioService;
    @Mock private ProductoService productoService;
    @Mock private MetodoPagoService metodoPagoService;
    @Mock private EventoAuditoriaService auditoriaService;

    @InjectMocks private OrdenServiceImpl service;

    private Usuario crearUsuario(Long id) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario("user@test.com");
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");
        u.setRol(rol);
        return u;
    }

    private Producto crearProducto(Long id, int stock, boolean activo) {
        Producto p = new Producto();
        p.setId(id);
        p.setNombre("Camiseta");
        p.setPrecio(50.0);
        p.setStock(stock);
        p.setActivo(activo);
        return p;
    }

    private Orden crearOrden(Long id, String estado, Usuario usuario) {
        Orden o = new Orden();
        o.setId(id);
        o.setEstado(estado);
        o.setTotal(0.0);
        o.setFechaCreacion(LocalDateTime.now());
        o.setUsuario(usuario);
        return o;
    }

    private ItemOrden crearItem(Long id, Orden orden, Producto producto, int cantidad) {
        ItemOrden item = new ItemOrden();
        item.setId(id);
        item.setOrden(orden);
        item.setProducto(producto);
        item.setCantidad(cantidad);
        item.setPrecioUnitario(producto.getPrecio());
        return item;
    }

    // ── AGREGAR ITEM ──────────────────────────────────────────────────────

    @Test
    void agregarItem_carritoNuevo_creaOrdenYAgregaItem() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 10, true);
        Orden ordenNueva = crearOrden(1L, "PENDIENTE", usuario);
        ItemOrden item = crearItem(1L, ordenNueva, producto, 2);

        AgregarItemDTO dto = new AgregarItemDTO();
        dto.setProductoId(1L);
        dto.setCantidad(2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(productoService.obtenerEntidadPorId(1L)).thenReturn(producto);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.empty());
        when(ordenRepository.save(any(Orden.class))).thenReturn(ordenNueva);
        when(itemOrdenRepository.findByOrdenIdAndProductoId(1L, 1L)).thenReturn(Optional.empty());
        when(itemOrdenRepository.save(any(ItemOrden.class))).thenReturn(item);
        when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(item));
        doNothing().when(auditoriaService).registrar(any(), any(), any(), any(), any());

        OrdenResponseDTO resultado = service.agregarItem("user@test.com", dto);

        assertNotNull(resultado);
        verify(ordenRepository, times(2)).save(any(Orden.class));
        verify(itemOrdenRepository).save(any(ItemOrden.class));
    }

    @Test
    void agregarItem_stockInsuficiente_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 1, true);

        AgregarItemDTO dto = new AgregarItemDTO();
        dto.setProductoId(1L);
        dto.setCantidad(5);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(productoService.obtenerEntidadPorId(1L)).thenReturn(producto);

        assertThrows(StockInsuficienteException.class,
                () -> service.agregarItem("user@test.com", dto));
    }

    @Test
    void agregarItem_carritoExistente_actualizaItem() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 10, true);
        Orden ordenExistente = crearOrden(1L, "PENDIENTE", usuario);
        ItemOrden itemExistente = crearItem(1L, ordenExistente, producto, 1);

        AgregarItemDTO dto = new AgregarItemDTO();
        dto.setProductoId(1L);
        dto.setCantidad(2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(productoService.obtenerEntidadPorId(1L)).thenReturn(producto);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(ordenExistente));
        when(itemOrdenRepository.findByOrdenIdAndProductoId(1L, 1L)).thenReturn(Optional.of(itemExistente));
        when(itemOrdenRepository.save(any(ItemOrden.class))).thenReturn(itemExistente);
        when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(itemExistente));
        doNothing().when(auditoriaService).registrar(any(), any(), any(), any(), any());

        OrdenResponseDTO resultado = service.agregarItem("user@test.com", dto);

        assertNotNull(resultado);
        assertEquals(3, itemExistente.getCantidad());
    }

    // ── OBTENER CARRITO ───────────────────────────────────────────────────

    @Test
    void obtenerCarrito_carritoExistente_retornaDTO() {
        Usuario usuario = crearUsuario(1L);
        Orden orden = crearOrden(1L, "PENDIENTE", usuario);
        Producto producto = crearProducto(1L, 10, true);
        ItemOrden item = crearItem(1L, orden, producto, 2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
        when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(item));

        OrdenResponseDTO resultado = service.obtenerCarrito("user@test.com");

        assertNotNull(resultado);
        assertEquals("PENDIENTE", resultado.getEstado());
    }

    @Test
    void obtenerCarrito_sinCarrito_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.empty());

        assertThrows(OrdenNotFoundException.class,
                () -> service.obtenerCarrito("user@test.com"));
    }

    // ── ELIMINAR ITEM ─────────────────────────────────────────────────────

    @Test
    void eliminarItem_carritoConMasItems_eliminaItem() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 10, true);
        Orden orden = crearOrden(1L, "PENDIENTE", usuario);
        orden.setTotal(100.0);
        ItemOrden item = crearItem(1L, orden, producto, 2);
        ItemOrden otroItem = crearItem(2L, orden, producto, 1);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
        when(itemOrdenRepository.findById(1L)).thenReturn(Optional.of(item));
        when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(otroItem));
        when(ordenRepository.save(any(Orden.class))).thenReturn(orden);

        OrdenResponseDTO resultado = service.eliminarItem("user@test.com", 1L);

        assertNotNull(resultado);
        verify(itemOrdenRepository).delete(item);
    }

    @Test
    void eliminarItem_ultimoItem_eliminaOrden() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 10, true);
        Orden orden = crearOrden(1L, "PENDIENTE", usuario);
        orden.setTotal(100.0);
        ItemOrden item = crearItem(1L, orden, producto, 2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
        when(itemOrdenRepository.findById(1L)).thenReturn(Optional.of(item));
        when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of());

        service.eliminarItem("user@test.com", 1L);

        verify(ordenRepository).delete(orden);
    }

    // ── CANCELAR ORDEN ────────────────────────────────────────────────────

    @Test
    void cancelarOrden_carritoExistente_cancelaOrden() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 10, true);
        Orden orden = crearOrden(1L, "PENDIENTE", usuario);
        ItemOrden item = crearItem(1L, orden, producto, 2);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
        when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(item));
        when(ordenRepository.save(any(Orden.class))).thenReturn(orden);
        doNothing().when(auditoriaService).registrar(any(), any(), any(), any(), any());

        OrdenResponseDTO resultado = service.cancelarOrden("user@test.com");

        assertNotNull(resultado);
        assertEquals("CANCELADA", orden.getEstado());
    }

    @Test
    void cancelarOrden_sinCarrito_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.empty());

        assertThrows(OrdenNotFoundException.class,
                () -> service.cancelarOrden("user@test.com"));
    }

    // ── HISTORIAL ─────────────────────────────────────────────────────────

    @Test
    void historial_conOrdenes_retornaLista() {
        Usuario usuario = crearUsuario(1L);
        Producto producto = crearProducto(1L, 10, true);
        Orden orden = crearOrden(1L, "PAGADA", usuario);
        ItemOrden item = crearItem(1L, orden, producto, 1);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstadoNot(1L, "PENDIENTE")).thenReturn(List.of(orden));
        when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(item));

        var resultado = service.historial("user@test.com");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void historial_sinOrdenes_retornaListaVacia() {
        Usuario usuario = crearUsuario(1L);

        when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
        when(ordenRepository.findByUsuarioIdAndEstadoNot(1L, "PENDIENTE")).thenReturn(List.of());

        var resultado = service.historial("user@test.com");

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }
    @Test
void confirmarOrden_carritoVacio_lanzaExcepcion() {
    Usuario usuario = crearUsuario(1L);
    Orden orden = crearOrden(1L, "PENDIENTE", usuario);

    when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
    when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
    when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of());

    co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO dto =
            new co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO();
    dto.setMetodoPagoId(1L);

    assertThrows(co.edu.unbosque.mundial_2026.exception.CarritoVacioException.class,
            () -> service.confirmarOrden("user@test.com", dto));
}

@Test
void confirmarOrden_metodoPagoDeOtroUsuario_lanzaExcepcion() {
    Usuario usuario = crearUsuario(1L);
    Usuario otroUsuario = crearUsuario(2L);
    Orden orden = crearOrden(1L, "PENDIENTE", usuario);
    Producto producto = crearProducto(1L, 10, true);
    ItemOrden item = crearItem(1L, orden, producto, 2);
    MetodoPago metodoPago = new MetodoPago();
    metodoPago.setId(1L);
    metodoPago.setUsuario(otroUsuario);

    when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
    when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
    when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(item));
    when(metodoPagoService.obtenerEntidadPorId(1L)).thenReturn(metodoPago);

    co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO dto =
            new co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO();
    dto.setMetodoPagoId(1L);

    assertThrows(co.edu.unbosque.mundial_2026.exception.MetodoPagoInvalidoException.class,
            () -> service.confirmarOrden("user@test.com", dto));
}

@Test
void confirmarOrden_stockInsuficiente_lanzaExcepcion() {
    Usuario usuario = crearUsuario(1L);
    Orden orden = crearOrden(1L, "PENDIENTE", usuario);
    Producto producto = crearProducto(1L, 1, true);
    ItemOrden item = crearItem(1L, orden, producto, 5);
    MetodoPago metodoPago = new MetodoPago();
    metodoPago.setId(1L);
    metodoPago.setUsuario(usuario);

    when(usuarioService.obtenerEntidadPorCorreo("user@test.com")).thenReturn(usuario);
    when(ordenRepository.findByUsuarioIdAndEstado(1L, "PENDIENTE")).thenReturn(Optional.of(orden));
    when(itemOrdenRepository.findByOrdenId(1L)).thenReturn(List.of(item));
    when(metodoPagoService.obtenerEntidadPorId(1L)).thenReturn(metodoPago);

    co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO dto =
            new co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO();
    dto.setMetodoPagoId(1L);

    assertThrows(co.edu.unbosque.mundial_2026.exception.StockInsuficienteException.class,
            () -> service.confirmarOrden("user@test.com", dto));
}
}
