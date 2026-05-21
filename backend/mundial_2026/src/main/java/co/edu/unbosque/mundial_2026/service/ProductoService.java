package co.edu.unbosque.mundial_2026.service;

import java.util.List;
import co.edu.unbosque.mundial_2026.dto.request.ProductoActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.ProductoRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.ProductoResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Producto;

public interface ProductoService {
    ProductoResponseDTO crear(ProductoRequestDTO dto);
    ProductoResponseDTO actualizar(Long id, ProductoActualizarRequestDTO dto);
    void eliminar(Long id);
    void reactivar(Long id);
    List<ProductoResponseDTO> listarTodos();
    List<ProductoResponseDTO> listarTodos(boolean soloActivos);
    List<ProductoResponseDTO> listarPorCategoria(Long categoriaId);
    ProductoResponseDTO obtenerPorId(Long id);
    Producto obtenerEntidadPorId(Long id);
    void actualizarStock(Long productoId, int cantidad);
}