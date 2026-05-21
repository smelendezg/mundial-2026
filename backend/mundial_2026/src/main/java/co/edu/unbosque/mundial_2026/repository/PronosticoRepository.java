package co.edu.unbosque.mundial_2026.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.mundial_2026.entity.Pronostico;

@Repository
public interface PronosticoRepository extends JpaRepository<Pronostico, Long> {
    List<Pronostico> findByApuestaId(Long apuestaId);
    List<Pronostico> findByApuestaIdAndUsuarioId(Long apuestaId, Long usuarioId);
    void deleteByApuestaId(Long apuestaId);

    @Query("SELECT p.partido.id, p.partido.seleccionLocal, p.partido.seleccionVisitante, p.partido.ronda, COUNT(p) FROM Pronostico p GROUP BY p.partido.id, p.partido.seleccionLocal, p.partido.seleccionVisitante, p.partido.ronda ORDER BY COUNT(p) DESC")
    List<Object[]> findPartidosMasApostados(Pageable pageable);
}