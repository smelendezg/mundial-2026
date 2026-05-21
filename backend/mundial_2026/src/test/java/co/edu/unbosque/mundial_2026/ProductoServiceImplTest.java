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

import co.edu.unbosque.mundial_2026.dto.request.ProductoActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.ProductoRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.ProductoResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Categoria;
import co.edu.unbosque.mundial_2026.entity.Producto;
import co.edu.unbosque.mundial_2026.exception.ProductoNotFoundException;
import co.edu.unbosque.mundial_2026.repository.ProductoRepository;
import co.edu.unbosque.mundial_2026.service.CategoriaService;
import co.edu.unbosque.mundial_2026.service.ProductoServiceImpl;

@ExtendWith(MockitoExtension.class)
 class ProductoServiceImplTest {

    @Mock private ProductoRepository productoRepository;
    @Mock private CategoriaService categoriaService;

    @InjectMocks private ProductoServiceImpl service;

    private Categoria crearCategoria(Long id) {
        Categoria c = new Categoria();
        c.setId(id);
        c.setNombre("Ropa");
        c.setDescripcion("Ropa del mundial");
        return c;
    }

    private Producto crearProducto(Long id, boolean activo) {
        Categoria categoria = crearCategoria(1L);
        Producto p = new Producto();
        p.setId(id);
        p.setNombre("Camiseta");
        p.setDescripcion("Camiseta Colombia");
        p.setPrecio(50.0);
        p.setStock(10);
        p.setActivo(activo);
        p.setCategoria(categoria);
        return p;
    }

    @Test
    void crear_datosValidos_retornaDTO() {
        Categoria categoria = crearCategoria(1L);
        Producto producto = crearProducto(1L, true);

        ProductoRequestDTO dto = new ProductoRequestDTO();
        dto.setNombre("Camiseta");
        dto.setDescripcion("Camiseta Colombia");
        dto.setPrecio(50.0);
        dto.setStock(10);
        dto.setCategoriaId(1L);

        when(categoriaService.obtenerEntidadPorId(1L)).thenReturn(categoria);
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        ProductoResponseDTO resultado = service.crear(dto);

        assertNotNull(resultado);
        verify(productoRepository).save(any(Producto.class));
    }

    @Test
    void actualizar_productoExistente_retornaDTO() {
        Producto producto = crearProducto(1L, true);

        ProductoActualizarRequestDTO dto = new ProductoActualizarRequestDTO();
        dto.setPrecio(75.0);
        dto.setStock(20);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        ProductoResponseDTO resultado = service.actualizar(1L, dto);

        assertNotNull(resultado);
        assertEquals(75.0, producto.getPrecio());
        assertEquals(20, producto.getStock());
    }

   @Test
void actualizar_productoNoExistente_lanzaExcepcion() {
    when(productoRepository.findById(99L)).thenReturn(Optional.empty());

    ProductoActualizarRequestDTO dto = new ProductoActualizarRequestDTO();

    assertThrows(ProductoNotFoundException.class,
            () -> service.actualizar(99L, dto));
}
    @Test
    void eliminar_productoExistente_desactiva() {
        Producto producto = crearProducto(1L, true);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        service.eliminar(1L);

        assertFalse(producto.getActivo());
        verify(productoRepository).save(producto);
    }

    @Test
    void eliminar_productoNoExistente_lanzaExcepcion() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ProductoNotFoundException.class, () -> service.eliminar(99L));
    }

    @Test
    void listarTodos_retornaProductosActivos() {
        when(productoRepository.findByActivoTrue()).thenReturn(List.of(crearProducto(1L, true)));

        var resultado = service.listarTodos();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void listarTodos_sinProductos_retornaVacio() {
        when(productoRepository.findByActivoTrue()).thenReturn(List.of());

        var resultado = service.listarTodos();

        assertTrue(resultado.isEmpty());
    }

    @Test
    void listarTodos_soloActivos_false_retornaToods() {
        when(productoRepository.findAll()).thenReturn(List.of(crearProducto(1L, true), crearProducto(2L, false)));

        var resultado = service.listarTodos(false);

        assertEquals(2, resultado.size());
    }

    @Test
    void listarPorCategoria_retornaProductos() {
        Categoria categoria = crearCategoria(1L);

        when(categoriaService.obtenerEntidadPorId(1L)).thenReturn(categoria);
        when(productoRepository.findByCategoriaIdAndActivoTrue(1L)).thenReturn(List.of(crearProducto(1L, true)));

        var resultado = service.listarPorCategoria(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void obtenerPorId_activo_retornaDTO() {
        Producto producto = crearProducto(1L, true);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        ProductoResponseDTO resultado = service.obtenerPorId(1L);

        assertNotNull(resultado);
    }

    @Test
    void obtenerPorId_inactivo_lanzaExcepcion() {
        Producto producto = crearProducto(1L, false);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        assertThrows(ProductoNotFoundException.class, () -> service.obtenerPorId(1L));
    }

    @Test
    void obtenerPorId_noExistente_lanzaExcepcion() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ProductoNotFoundException.class, () -> service.obtenerPorId(99L));
    }

    @Test
    void actualizarStock_productoExistente_reducStock() {
        Producto producto = crearProducto(1L, true);
        producto.setStock(10);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        service.actualizarStock(1L, 3);

        assertEquals(7, producto.getStock());
    }

    @Test
    void reactivar_productoInactivo_activa() {
        Producto producto = crearProducto(1L, false);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        service.reactivar(1L);

        assertTrue(producto.getActivo());
    }

    @Test
    void obtenerEntidadPorId_existente_retornaEntidad() {
        Producto producto = crearProducto(1L, true);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        Producto resultado = service.obtenerEntidadPorId(1L);

        assertNotNull(resultado);
    }
}
