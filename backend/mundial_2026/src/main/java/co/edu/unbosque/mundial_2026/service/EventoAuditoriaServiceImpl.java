package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unbosque.mundial_2026.dto.EventoAuditoriaDTO;
import co.edu.unbosque.mundial_2026.entity.EventoAuditoria;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.repository.EventoAuditoriaRepository;
import org.springframework.context.annotation.Lazy;
@Service
public class EventoAuditoriaServiceImpl implements EventoAuditoriaService {

    private final EventoAuditoriaRepository repository;
    private final UsuarioService usuarioService;
   

    public EventoAuditoriaServiceImpl(EventoAuditoriaRepository repository, @Lazy UsuarioService usuarioService) {
    this.repository = repository;
    this.usuarioService = usuarioService;
}

    @Override
    @Transactional
    public void registrar(String tipo, String descripcion, Long usuarioId, String idCorrelacion, String entidadCorrelacion) {
      Usuario usuario = null;
if (usuarioId != null) {
    usuario = usuarioService.obtenerEntidadPorId(usuarioId);
}
        EventoAuditoria evento = new EventoAuditoria(tipo, descripcion, LocalDateTime.now(), idCorrelacion, entidadCorrelacion, usuario);
        repository.save(evento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoAuditoriaDTO> buscarPorUsuario(Long usuarioId) {
        List<EventoAuditoria> lista = repository.findByUsuarioId(usuarioId);
        List<EventoAuditoriaDTO> dtos = new ArrayList<>();
        for (int i = 0; i < lista.size(); i++) {
            dtos.add(toDTO(lista.get(i)));
        }
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoAuditoriaDTO> buscarPorTipo(String tipo) {
        List<EventoAuditoria> lista = repository.findByTipo(tipo);
        List<EventoAuditoriaDTO> dtos = new ArrayList<>();
        for (int i = 0; i < lista.size(); i++) {
            dtos.add(toDTO(lista.get(i)));
        }
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoAuditoriaDTO> buscarPorCorrelacion(String correlacion) {
        List<EventoAuditoria> lista = repository.findByIdCorrelacion(correlacion);
        List<EventoAuditoriaDTO> dtos = new ArrayList<>();
        for (int i = 0; i < lista.size(); i++) {
            dtos.add(toDTO(lista.get(i)));
        }
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoAuditoriaDTO> buscarPorEntidad(String entidadCorrelacion) {
        List<EventoAuditoria> lista = repository.findByEntidadCorrelacion(entidadCorrelacion);
        List<EventoAuditoriaDTO> dtos = new ArrayList<>();
        for (int i = 0; i < lista.size(); i++) {
            dtos.add(toDTO(lista.get(i)));
        }
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoAuditoriaDTO> buscarPorFecha(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        List<EventoAuditoria> lista = repository.findByFechaBetween(fechaInicio, fechaFin);
        List<EventoAuditoriaDTO> dtos = new ArrayList<>();
        for (int i = 0; i < lista.size(); i++) {
            dtos.add(toDTO(lista.get(i)));
        }
        return dtos;
    }

    private EventoAuditoriaDTO toDTO(EventoAuditoria evento) {
        Long usuarioId = evento.getUsuario() != null ? evento.getUsuario().getId() : null;
        return new EventoAuditoriaDTO(evento.getId(), evento.getTipo(), evento.getDescripcion(),
                evento.getFecha(), evento.getIdCorrelacion(), evento.getEntidadCorrelacion(), usuarioId);
    }
}