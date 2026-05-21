package co.edu.unbosque.mundial_2026.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unbosque.mundial_2026.entity.EventoAuditoria;
import co.edu.unbosque.mundial_2026.entity.Usuario;

public interface EventoAuditoriaRepository extends JpaRepository<EventoAuditoria, Long> {
    List<EventoAuditoria> findByUsuario(Usuario usuario);
    List<EventoAuditoria> findByTipo(String tipo);
    List<EventoAuditoria> findByIdCorrelacion(String idCorrelacion);
    List<EventoAuditoria> findByEntidadCorrelacion(String entidadCorrelacion);
    List<EventoAuditoria> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
    List<EventoAuditoria> findByUsuarioId(Long usuarioId);
}