package co.edu.unbosque.mundial_2026.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unbosque.mundial_2026.entity.MetodoPago;

public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {
    List<MetodoPago> findByUsuarioId(Long usuarioId);
    List<MetodoPago> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
}