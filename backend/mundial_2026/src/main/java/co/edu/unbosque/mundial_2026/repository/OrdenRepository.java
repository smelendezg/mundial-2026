package co.edu.unbosque.mundial_2026.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import co.edu.unbosque.mundial_2026.entity.Orden;

public interface OrdenRepository extends JpaRepository<Orden, Long> {
    Optional<Orden> findByUsuarioIdAndEstado(Long usuarioId, String estado);
    List<Orden> findByUsuarioIdAndEstadoNot(Long usuarioId, String estado);

    @Query("SELECT COALESCE(SUM(o.total), 0.0) FROM Orden o WHERE o.fechaPago IS NOT NULL")
    Double sumIngresoTotal();

    @Query("SELECT COALESCE(mp.tipo, 'Sin método'), COUNT(o), COALESCE(SUM(o.total), 0.0) FROM Orden o LEFT JOIN o.metodoPago mp WHERE o.fechaPago IS NOT NULL GROUP BY mp.tipo ORDER BY COALESCE(SUM(o.total), 0.0) DESC")
    List<Object[]> findIngresosPorMetodoPago();
}