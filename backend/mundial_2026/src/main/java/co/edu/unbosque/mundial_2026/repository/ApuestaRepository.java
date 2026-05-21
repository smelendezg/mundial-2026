package co.edu.unbosque.mundial_2026.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.mundial_2026.entity.Apuesta;

@Repository
public interface ApuestaRepository extends JpaRepository<Apuesta, Long> {
    Optional<Apuesta> findByCodigoInvitacion(String codigoInvitacion);

    List<Apuesta> findByCreadaPorId(Long usuarioId);

    List<Apuesta> findByEstado(String estado);

    List<Apuesta> findByEstadoAndFechaCierreBefore(String estado, LocalDateTime fecha);
}