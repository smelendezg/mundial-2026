package co.edu.unbosque.mundial_2026.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import co.edu.unbosque.mundial_2026.entity.Entrada;

public interface EntradaRepository extends JpaRepository<Entrada, Long> {
    List<Entrada> findByUsuarioId(Long usuarioId);

    List<Entrada> findByEstadoAndTtlReservaLessThan(String estado, LocalDateTime fecha);

    List<Entrada> findByUsuarioIdAndFechaCompraBetween(Long usuarioId, LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT COALESCE(SUM(e.cantidad), 0) FROM Entrada e WHERE e.fechaPago IS NOT NULL")
    Long sumEntradasVendidas();
}