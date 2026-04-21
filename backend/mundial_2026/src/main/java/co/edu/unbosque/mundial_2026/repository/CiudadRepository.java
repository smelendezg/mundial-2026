package co.edu.unbosque.mundial_2026.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import co.edu.unbosque.mundial_2026.entity.CiudadFavorita;

@Repository
public interface CiudadRepository extends JpaRepository<CiudadFavorita, Long> {}