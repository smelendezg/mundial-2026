package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.MetodoPagoResponseDTO;
import co.edu.unbosque.mundial_2026.entity.MetodoPago;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.MetodoPagoNotFoundException;
import co.edu.unbosque.mundial_2026.repository.MetodoPagoRepository;

@Service
public class MetodoPagoServiceImpl implements MetodoPagoService {

    private final MetodoPagoRepository metodoPagoRepository;
    private final UsuarioService usuarioService;
    

    public MetodoPagoServiceImpl(MetodoPagoRepository metodoPagoRepository, UsuarioService usuarioService) {
    this.metodoPagoRepository = metodoPagoRepository;
    this.usuarioService = usuarioService;
}

   @Override
public MetodoPagoResponseDTO agregar(MetodoPagoRequestDTO dto) {
 Usuario usuario = usuarioService.obtenerEntidadPorId(dto.getUsuarioId());
List<MetodoPago> existentes = metodoPagoRepository.findByUsuarioId(dto.getUsuarioId());
    boolean esElPrimero = existentes.isEmpty();

    MetodoPago metodo = new MetodoPago();
    metodo.setUsuario(usuario);
    metodo.setTipo(dto.getType());
    metodo.setLabel(dto.getLabel());
    metodo.setDetails(dto.getDetails());
    metodo.setDefault(esElPrimero);
    metodo.setCreatedAt(LocalDateTime.now().toString());

    metodoPagoRepository.save(metodo);
    return toDTO(metodo);
}

    @Override
    public List<MetodoPagoResponseDTO> listarPorUsuario(Long usuarioId) {
        List<MetodoPago> lista = metodoPagoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId);
        List<MetodoPagoResponseDTO> dtos = new ArrayList<>();
        for (int i = 0; i < lista.size(); i++) {
            dtos.add(toDTO(lista.get(i)));
        }
        return dtos;
    }

    @Override
    public boolean setDefault(Long usuarioId, Long metodoPagoId) {
        List<MetodoPago> todos = metodoPagoRepository.findByUsuarioId(usuarioId);
        MetodoPago target = null;

        for (int i = 0; i < todos.size(); i++) {
            todos.get(i).setDefault(false);
            if (todos.get(i).getId().equals(metodoPagoId)) {
                target = todos.get(i);
            }
        }

        if (target == null) {
            throw new MetodoPagoNotFoundException("Método de pago no encontrado");
        }

        target.setDefault(true);
        metodoPagoRepository.saveAll(todos);
        return true;
    }

    private MetodoPagoResponseDTO toDTO(MetodoPago metodo) {
    MetodoPagoResponseDTO dto = new MetodoPagoResponseDTO();
    dto.setUserId(String.valueOf(metodo.getUsuario().getId()));
    dto.setUserId(String.valueOf(metodo.getUsuario().getId()));
    dto.setType(metodo.getTipo());
    dto.setLabel(metodo.getLabel());
    dto.setDetails(metodo.getDetails());
    dto.setDefault(metodo.isDefault());
    dto.setCreatedAt(metodo.getCreatedAt());
    dto.setId(String.valueOf(metodo.getId()));
    return dto;
}
@Override
@Transactional(readOnly = true)
public MetodoPago obtenerEntidadPorId(final Long id) {
    return metodoPagoRepository.findById(id)
            .orElseThrow(() -> new MetodoPagoNotFoundException(
                    "Método de pago no encontrado con id: " + id));
}
@Override
public MetodoPagoResponseDTO agregar(String correo, MetodoPagoRequestDTO dto) {
    Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo);
    List<MetodoPago> existentes = metodoPagoRepository.findByUsuarioId(usuario.getId());
    boolean esElPrimero = existentes.isEmpty();

    MetodoPago metodo = new MetodoPago();
    metodo.setUsuario(usuario);
    metodo.setTipo(dto.getType());
    metodo.setLabel(dto.getLabel());
    metodo.setDetails(dto.getDetails());
    metodo.setDefault(esElPrimero);
    metodo.setCreatedAt(LocalDateTime.now().toString());

    metodoPagoRepository.save(metodo);
    return toDTO(metodo);
}

@Override
public List<MetodoPagoResponseDTO> listarPorCorreo(String correo) {
    Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo);
    List<MetodoPago> lista = metodoPagoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuario.getId());
    List<MetodoPagoResponseDTO> dtos = new ArrayList<>();
    for (int i = 0; i < lista.size(); i++) {
        dtos.add(toDTO(lista.get(i)));
    }
    return dtos;
}
@Override
@Transactional
public void setDefaultPorCorreo(String correo, Long metodoPagoId) {
    Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo);
    List<MetodoPago> todos = metodoPagoRepository.findByUsuarioId(usuario.getId());
    MetodoPago target = null;
    for (int i = 0; i < todos.size(); i++) {
        todos.get(i).setDefault(false);
        if (todos.get(i).getId().equals(metodoPagoId)) {
            target = todos.get(i);
        }
    }
    if (target == null) {
        throw new MetodoPagoNotFoundException("Método de pago no encontrado");
    }
    target.setDefault(true);
    metodoPagoRepository.saveAll(todos);
}
}