package co.edu.unbosque.mundial_2026.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unbosque.mundial_2026.dto.request.ProductoActualizarRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.ProductoRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.ProductoResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Categoria;
import co.edu.unbosque.mundial_2026.entity.Producto;
import co.edu.unbosque.mundial_2026.exception.ProductoNotFoundException;
import co.edu.unbosque.mundial_2026.repository.ProductoRepository;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    public ProductoServiceImpl(ProductoRepository productoRepository, CategoriaService categoriaService) {
        this.productoRepository = productoRepository;
        this.categoriaService = categoriaService;
    }

    private final CategoriaService categoriaService;

    private static final String PRODUCTO_NO_ENCONTRADO = "No existe ese producto";
    

    @Override
    public ProductoResponseDTO crear(ProductoRequestDTO dto) {
      Categoria categoria = categoriaService.obtenerEntidadPorId(dto.getCategoriaId());
        Producto producto = toEntity(dto, categoria);
        productoRepository.save(producto);
         return toDTO(producto);
        
    }

    @Override
public ProductoResponseDTO actualizar(Long id, ProductoActualizarRequestDTO dto) {
    Producto productoActualizar = productoRepository.findById(id)
            .orElseThrow(() -> new ProductoNotFoundException(PRODUCTO_NO_ENCONTRADO));

    if (dto.getPrecio() != null) {
        productoActualizar.setPrecio(dto.getPrecio());
    }
    if (dto.getStock() != null) {
        productoActualizar.setStock(dto.getStock());
    }
    if (dto.getImagenUrl() != null) {
        productoActualizar.setImagenUrl(dto.getImagenUrl());
    }
    if (dto.getDescripcion() != null) {
        productoActualizar.setDescripcion(dto.getDescripcion());
    }
    if (dto.getCodigoProducto() != null) {
        productoActualizar.setCodigoProducto(dto.getCodigoProducto());
    }
    if (dto.getTalla() != null) {
        productoActualizar.setTalla(dto.getTalla());
    }
    if (dto.getEquipo() != null) {
        productoActualizar.setEquipo(dto.getEquipo());
    }
    if (dto.getBandera() != null) {
        productoActualizar.setBandera(dto.getBandera());
    }
    if (dto.getDestacado() != null) {
        productoActualizar.setDestacado(dto.getDestacado());
    }

    productoRepository.save(productoActualizar);
    return toDTO(productoActualizar);
}

   @Override
public void eliminar(Long id) {
    Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new ProductoNotFoundException(PRODUCTO_NO_ENCONTRADO));
    producto.setActivo(false);
    productoRepository.save(producto);
}

@Override
public List<ProductoResponseDTO> listarTodos() {
    List<Producto> productos = productoRepository.findByActivoTrue();
    List<ProductoResponseDTO> responseDTOs = new ArrayList<>();
    for (int i = 0; i < productos.size(); i++) {
        Producto producto = productos.get(i);
        ProductoResponseDTO dto = toDTO(producto);
        responseDTOs.add(dto);
    }
    return responseDTOs;
}

    @Override
public List<ProductoResponseDTO> listarPorCategoria(Long categoriaId) {
   categoriaService.obtenerEntidadPorId(categoriaId);
    List<Producto> productos = productoRepository.findByCategoriaIdAndActivoTrue(categoriaId);
    List<ProductoResponseDTO> responseDTOs = new ArrayList<>();
    for (int i = 0; i < productos.size(); i++) {
        Producto producto = productos.get(i);
        ProductoResponseDTO dto = toDTO(producto);
        responseDTOs.add(dto);
    }
    return responseDTOs;
}

@Override
public ProductoResponseDTO obtenerPorId(Long id) {
    Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new ProductoNotFoundException(PRODUCTO_NO_ENCONTRADO));
   if (Boolean.FALSE.equals(producto.getActivo())) {
        throw new ProductoNotFoundException("Este producto no está disponible");
    }
    return toDTO(producto);
}
   


@Override
@Transactional(readOnly = true)
public Producto obtenerEntidadPorId(final Long id) {
    return productoRepository.findById(id)
            .orElseThrow(() -> new ProductoNotFoundException(
                    "Producto no encontrado con id: " + id));
}

@Override
@Transactional
public void actualizarStock(final Long productoId, final int cantidad) {
    final Producto producto = productoRepository.findById(productoId)
            .orElseThrow(() -> new ProductoNotFoundException(
                    "Producto no encontrado con id: " + productoId));
    producto.setStock(producto.getStock() - cantidad);
    productoRepository.save(producto);
}
@Override
@Transactional
public void reactivar(Long id) {
    Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new ProductoNotFoundException(PRODUCTO_NO_ENCONTRADO));
    producto.setActivo(true);
    productoRepository.save(producto);
}

@Override
@Transactional(readOnly = true)
public List<ProductoResponseDTO> listarTodos(boolean soloActivos) {
    List<Producto> productos = soloActivos
            ? productoRepository.findByActivoTrue()
            : productoRepository.findAll();
    List<ProductoResponseDTO> responseDTOs = new ArrayList<>();
    for (int i = 0; i < productos.size(); i++) {
        responseDTOs.add(toDTO(productos.get(i)));
    }
    return responseDTOs;
}
private ProductoResponseDTO toDTO(Producto producto) {
    ProductoResponseDTO response = new ProductoResponseDTO();
    response.setId(producto.getId());
    response.setNombre(producto.getNombre());
    response.setDescripcion(producto.getDescripcion());
    response.setPrecio(producto.getPrecio());
    response.setStock(producto.getStock());
    response.setImagenUrl(producto.getImagenUrl());
    response.setActivo(producto.getActivo());
    response.setCategoriaNombre(producto.getCategoria().getNombre());
    response.setCodigoProducto(producto.getCodigoProducto());
    response.setTalla(producto.getTalla());
    response.setEquipo(producto.getEquipo());
    response.setBandera(producto.getBandera());
    response.setDestacado(producto.getDestacado());
    return response;
}

private Producto toEntity(ProductoRequestDTO dto, Categoria categoria) {
    Producto producto = new Producto();
    producto.setNombre(dto.getNombre());
    producto.setDescripcion(dto.getDescripcion());
    producto.setPrecio(dto.getPrecio());
    producto.setStock(dto.getStock());
    producto.setImagenUrl(dto.getImagenUrl());
    producto.setActivo(true);
    producto.setCategoria(categoria);
    producto.setCodigoProducto(dto.getCodigoProducto());
    producto.setTalla(dto.getTalla());
    producto.setEquipo(dto.getEquipo());
    producto.setBandera(dto.getBandera());
    producto.setDestacado(Boolean.TRUE.equals(dto.getDestacado()));
    return producto;
}
}