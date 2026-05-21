package co.edu.unbosque.mundial_2026.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.mundial_2026.entity.Seleccion;

@Repository
public interface SeleccionRepository extends JpaRepository<Seleccion, Long> {
    Optional<Seleccion> findById(Long id);
    List<Seleccion> findAllById(Iterable<Long> ids);
}