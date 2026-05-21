package co.edu.unbosque.mundial_2026.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.mundial_2026.entity.Participacion;

@Repository
public interface ParticipacionRepository extends JpaRepository<Participacion, Long> {
    Optional<Participacion> findByUsuarioIdAndApuestaId(Long usuarioId, Long apuestaId);
    List<Participacion> findByApuestaId(Long apuestaId);
    List<Participacion> findByApuestaIdOrderByPuntosDesc(Long apuestaId);
    List<Participacion> findByUsuarioId(Long usuarioId);
    void deleteByApuestaId(Long apuestaId);

    @Query("SELECT p.apuesta.id, p.apuesta.nombre, p.apuesta.estado, COUNT(p) FROM Participacion p GROUP BY p.apuesta.id, p.apuesta.nombre, p.apuesta.estado ORDER BY COUNT(p) DESC")
    List<Object[]> findPollaRanking(Pageable pageable);
}