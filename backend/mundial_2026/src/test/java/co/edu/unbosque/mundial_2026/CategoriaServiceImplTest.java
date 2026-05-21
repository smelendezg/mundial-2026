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

import co.edu.unbosque.mundial_2026.dto.request.CategoriaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.CategoriaResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Categoria;
import co.edu.unbosque.mundial_2026.entity.Producto;
import co.edu.unbosque.mundial_2026.exception.CategoriaNotFoundException;
import co.edu.unbosque.mundial_2026.exception.CategoriaYaExisteException;
import co.edu.unbosque.mundial_2026.repository.CategoriaRepository;
import co.edu.unbosque.mundial_2026.repository.ProductoRepository;
import co.edu.unbosque.mundial_2026.service.CategoriaServiceImpl;

@ExtendWith(MockitoExtension.class)
 class CategoriaServiceImplTest {

    @Mock private CategoriaRepository categoriaRepository;
    @Mock private ProductoRepository productoRepository;

    @InjectMocks private CategoriaServiceImpl service;

    private Categoria crearCategoria(Long id, String nombre) {
        Categoria c = new Categoria();
        c.setId(id);
        c.setNombre(nombre);
        c.setDescripcion("Descripcion test");
        return c;
    }

    private Producto crearProducto(Long id, Categoria categoria) {
        Producto p = new Producto();
        p.setId(id);
        p.setNombre("Producto test");
        p.setPrecio(10.0);
        p.setStock(5);
        p.setActivo(true);
        p.setCategoria(categoria);
        return p;
    }

    @Test
    void crear_nombreNuevo_retornaDTO() {
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre("Ropa");
        dto.setDescripcion("Ropa del mundial");

        Categoria categoria = crearCategoria(1L, "Ropa");

        when(categoriaRepository.findByNombre("Ropa")).thenReturn(Optional.empty());
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria);

        CategoriaResponseDTO resultado = service.crear(dto);

        assertNotNull(resultado);
        assertEquals("Ropa", resultado.getNombre());
        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    void crear_nombreExistente_lanzaExcepcion() {
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre("Ropa");

        when(categoriaRepository.findByNombre("Ropa")).thenReturn(Optional.of(crearCategoria(1L, "Ropa")));

        assertThrows(CategoriaYaExisteException.class, () -> service.crear(dto));
    }

    @Test
    void listar_conCategorias_retornaLista() {
        when(categoriaRepository.findAll()).thenReturn(List.of(crearCategoria(1L, "Ropa")));

        var resultado = service.listar();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void listar_sinCategorias_retornaListaVacia() {
        when(categoriaRepository.findAll()).thenReturn(List.of());

        var resultado = service.listar();

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    @Test
    void actualizar_categoriaExistente_retornaDTO() {
        Categoria categoria = crearCategoria(1L, "Ropa");
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre("Ropa Oficial");
        dto.setDescripcion("Nueva descripcion");

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.findByNombre("Ropa Oficial")).thenReturn(Optional.empty());
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria);

        CategoriaResponseDTO resultado = service.actualizar(1L, dto);

        assertNotNull(resultado);
        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    void actualizar_categoriaNoExistente_lanzaExcepcion() {
        CategoriaRequestDTO dto = new CategoriaRequestDTO();
        dto.setNombre("Ropa");

        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CategoriaNotFoundException.class, () -> service.actualizar(99L, dto));
    }

    @Test
    void eliminar_categoriaExistente_desactivaProductosYElimina() {
        Categoria categoria = crearCategoria(1L, "Ropa");
        Producto producto = crearProducto(1L, categoria);

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.findByCategoriaIdAndActivoTrue(1L)).thenReturn(List.of(producto));
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);
        doNothing().when(categoriaRepository).delete(categoria);

        service.eliminar(1L);

        assertFalse(producto.getActivo());
        verify(categoriaRepository).delete(categoria);
    }

    @Test
    void eliminar_categoriaNoExistente_lanzaExcepcion() {
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CategoriaNotFoundException.class, () -> service.eliminar(99L));
    }

    @Test
    void obtenerEntidadPorId_existente_retornaEntidad() {
        Categoria categoria = crearCategoria(1L, "Ropa");

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));

        Categoria resultado = service.obtenerEntidadPorId(1L);

        assertNotNull(resultado);
        assertEquals("Ropa", resultado.getNombre());
    }

    @Test
    void obtenerEntidadPorId_noExistente_lanzaExcepcion() {
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CategoriaNotFoundException.class, () -> service.obtenerEntidadPorId(99L));
    }
    @Test
void actualizar_nombreDuplicadoDeOtraCategoria_lanzaExcepcion() {
    Categoria categoria = crearCategoria(1L, "Ropa");
    Categoria otraCategoria = crearCategoria(2L, "Ropa Oficial");

    CategoriaRequestDTO dto = new CategoriaRequestDTO();
    dto.setNombre("Ropa Oficial");

    when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
    when(categoriaRepository.findByNombre("Ropa Oficial"))
            .thenReturn(Optional.of(otraCategoria)); // existe pero es otra categoría

    assertThrows(CategoriaYaExisteException.class,
            () -> service.actualizar(1L, dto));
}
}
