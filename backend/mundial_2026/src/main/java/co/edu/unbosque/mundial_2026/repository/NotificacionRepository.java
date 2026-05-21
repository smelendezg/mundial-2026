package co.edu.unbosque.mundial_2026.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.mundial_2026.entity.Notificacion;
import co.edu.unbosque.mundial_2026.entity.Usuario;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuario(Usuario usuario);

    List<Notificacion> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    List<Notificacion> findByUsuarioIdAndLeidaFalse(Long usuarioId);

    List<Notificacion> findByUsuarioIdAndEstado(Long usuarioId, String estado);
}