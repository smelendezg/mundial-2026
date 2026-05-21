package co.edu.unbosque.mundial_2026.service;

import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unbosque.mundial_2026.dto.request.CategoriaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.CategoriaResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Categoria;
import co.edu.unbosque.mundial_2026.entity.Producto;
import co.edu.unbosque.mundial_2026.exception.CategoriaNotFoundException;
import co.edu.unbosque.mundial_2026.exception.CategoriaYaExisteException;
import co.edu.unbosque.mundial_2026.repository.CategoriaRepository;
import co.edu.unbosque.mundial_2026.repository.ProductoRepository;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private static final String CATEGORIA_NO_ENCONTRADA = "Categoría no encontrada con id: ";

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    public CategoriaResponseDTO crear(CategoriaRequestDTO dto) {
        Optional<Categoria> existente = categoriaRepository.findByNombre(dto.getNombre());
        if (existente.isPresent()) {
   throw new CategoriaYaExisteException("Ya existe un nombre de esa categoria");
        }
        Categoria categoria = toEntity(dto);
        categoriaRepository.save(categoria);
        return toDTO(categoria);
    }

    @Override
    public List<CategoriaResponseDTO> listar() {
        List<Categoria> categorias = categoriaRepository.findAll();
        List<CategoriaResponseDTO> responseDTOs = new ArrayList<>();
        for (int i = 0; i < categorias.size(); i++) {
            Categoria categoria = categorias.get(i);
            CategoriaResponseDTO dto = toDTO(categoria);
            responseDTOs.add(dto);
        }
        return responseDTOs;
    }

    @Override
    @Transactional
    public CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new CategoriaNotFoundException(CATEGORIA_NO_ENCONTRADA + id));
        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            Optional<Categoria> existente = categoriaRepository.findByNombre(dto.getNombre());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw new CategoriaYaExisteException("Ya existe una categoría con ese nombre");
            }
            categoria.setNombre(dto.getNombre());
        }
        if (dto.getDescripcion() != null && !dto.getDescripcion().isBlank()) {
            categoria.setDescripcion(dto.getDescripcion());
        }
        categoriaRepository.save(categoria);
        return toDTO(categoria);
    }

   @Override
@Transactional
public void eliminar(Long id) {
    Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new CategoriaNotFoundException(CATEGORIA_NO_ENCONTRADA + id));
    List<Producto> productos = productoRepository.findByCategoriaIdAndActivoTrue(id);
    for (int i = 0; i < productos.size(); i++) {
        productos.get(i).setActivo(false);
        productoRepository.save(productos.get(i));
    }
    categoriaRepository.delete(categoria);
}

    @Override
    @Transactional(readOnly = true)
    public Categoria obtenerEntidadPorId(final Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new CategoriaNotFoundException(
                        CATEGORIA_NO_ENCONTRADA + id));
    }

    private CategoriaResponseDTO toDTO(Categoria categoria) {
        CategoriaResponseDTO response = new CategoriaResponseDTO();
        response.setId(categoria.getId());
        response.setNombre(categoria.getNombre());
        response.setDescripcion(categoria.getDescripcion());
        return response;
    }

    private Categoria toEntity(CategoriaRequestDTO dto) {
        Categoria categoria = new Categoria();
        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());
        return categoria;
    }
}