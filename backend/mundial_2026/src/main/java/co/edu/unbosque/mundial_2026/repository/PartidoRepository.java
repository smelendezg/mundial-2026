package co.edu.unbosque.mundial_2026.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.mundial_2026.entity.Partido;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {

    @Query("SELECT p FROM Partido p WHERE LOWER(p.seleccionLocal) LIKE LOWER(CONCAT('%', :nombre, '%')) OR LOWER(p.seleccionVisitante) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Partido> findBySeleccion(@Param("nombre") String nombre);

    @Query("SELECT p FROM Partido p WHERE LOWER(p.estadio) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Partido> findByEstadio(@Param("nombre") String nombre);
}