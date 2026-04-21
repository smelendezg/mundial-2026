package co.edu.unbosque.mundial_2026;


import java.util.logging.Logger;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import co.edu.unbosque.mundial_2026.entity.CiudadFavorita;
import co.edu.unbosque.mundial_2026.entity.EstadioFavorito;
import co.edu.unbosque.mundial_2026.entity.Rol;
import co.edu.unbosque.mundial_2026.entity.Seleccion;
import co.edu.unbosque.mundial_2026.repository.CiudadRepository;
import co.edu.unbosque.mundial_2026.repository.EstadioRepository;
import co.edu.unbosque.mundial_2026.repository.PartidoRepository;
import co.edu.unbosque.mundial_2026.repository.RolRepository;
import co.edu.unbosque.mundial_2026.repository.SeleccionRepository;
import co.edu.unbosque.mundial_2026.service.PartidoService;

@Configuration
public class AppConfig {

    private static final Logger logger = Logger.getLogger(AppConfig.class.getName());

    public AppConfig() {}

    @Bean
    @Order(0)
    public CommandLineRunner cargarRoles(RolRepository rolRepository) {
        return args -> {
            String[] roles = {
                "ROLE_USUARIO",
                "ROLE_ADMIN",
                "ROLE_OPERADOR",
                "ROLE_SOPORTE",
                "ROLE_LEGAL"
            };
            for (int i = 0; i < roles.length; i++) {
                if (rolRepository.findByNombre(roles[i]).isEmpty()) {
                    Rol rol = new Rol();
                    rol.setNombre(roles[i]);
                    rolRepository.save(rol);
                }
            }
            logger.info("Roles cargados: " + roles.length);
        };
    }

    @Bean
    @Order(1)
    public CommandLineRunner cargarPartidos(PartidoService partidoService,
            PartidoRepository partidoRepository) {
        return args -> {
            if (partidoRepository.count() == 0) {
                int total = partidoService.sincronizarDesdeAPI();
                logger.info("Partidos cargados: " + total);
            }
        };
    }

    @Bean
@Order(2)
public CommandLineRunner cargarSelecciones(
        SeleccionRepository seleccionRepository,
        PartidoService partidoService) {
    return args -> {
        if (seleccionRepository.count() == 0) {
            final var equipos = partidoService.obtenerSelecciones();
            int total = 0;

            for (int i = 0; i < equipos.size(); i++) {
                final var equipo = equipos.get(i).getSeleccion();
                if (equipo != null && equipo.getId() != null) {
                    if (!seleccionRepository.existsById(equipo.getId())) {
                        Seleccion s = new Seleccion();
                        s.setId(equipo.getId());
                        s.setNombre(equipo.getNombre());
                        seleccionRepository.save(s);
                        total++;
                    }
                }
            }
            logger.info("Selecciones cargadas: " + total);
        }
    };
}

   @Bean
@Order(3)
public CommandLineRunner cargarCiudadesYEstadios(
        CiudadRepository ciudadRepository,
        EstadioRepository estadioRepository) {
    return args -> {
        if (ciudadRepository.count() == 0) {

            java.util.Map<String, String> estadioCiudad = new java.util.LinkedHashMap<>();
            estadioCiudad.put("Estadio Azteca", "Ciudad de Mexico");
            estadioCiudad.put("Estadio Akron", "Guadalajara");
            estadioCiudad.put("Estadio BBVA", "Monterrey");
            estadioCiudad.put("BMO Field", "Toronto");
            estadioCiudad.put("BC Place", "Vancouver");
            estadioCiudad.put("SoFi Stadium", "Los Angeles");
            estadioCiudad.put("MetLife Stadium", "East Rutherford");
            estadioCiudad.put("Gillette Stadium", "Boston");
            estadioCiudad.put("NRG Stadium", "Houston");
            estadioCiudad.put("Lincoln Financial Field", "Philadelphia");
            estadioCiudad.put("Mercedes-Benz Stadium", "Atlanta");
            estadioCiudad.put("Lumen Field", "Seattle");
            estadioCiudad.put("Hard Rock Stadium", "Miami");
            estadioCiudad.put("Arrowhead Stadium", "Kansas City");

            java.util.Map<String, CiudadFavorita> ciudadesGuardadas = new java.util.HashMap<>();
            long ciudadId = 1;
            long estadioId = 1;

            for (java.util.Map.Entry<String, String> entry : estadioCiudad.entrySet()) {
                final String nombreEstadio = entry.getKey();
                final String nombreCiudad = entry.getValue();

                CiudadFavorita ciudad = ciudadesGuardadas.get(nombreCiudad);
                if (ciudad == null) {
                    ciudad = new CiudadFavorita();
                    ciudad.setId(ciudadId++);
                    ciudad.setNombre(nombreCiudad);
                    ciudad.setPais("USA/CAN/MEX");
                    ciudadRepository.save(ciudad);
                    ciudadesGuardadas.put(nombreCiudad, ciudad);
                }

                EstadioFavorito estadio = new EstadioFavorito();
                estadio.setId(estadioId++);
                estadio.setNombre(nombreEstadio);
                estadio.setCiudad(ciudad);
                estadioRepository.save(estadio);
            }

            logger.info("Ciudades cargadas: " + ciudadesGuardadas.size());
            logger.info("Estadios cargados: " + estadioCiudad.size());
        }
    };
}
}