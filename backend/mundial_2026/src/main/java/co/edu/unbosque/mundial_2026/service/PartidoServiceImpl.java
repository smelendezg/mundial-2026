package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.logging.Logger;
import co.edu.unbosque.mundial_2026.dto.response.EquipoMundialDTO;
import co.edu.unbosque.mundial_2026.dto.response.EquipoMundialResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.JugadorDTO;
import co.edu.unbosque.mundial_2026.dto.response.JugadorResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.PosicionDTO;
import co.edu.unbosque.mundial_2026.dto.response.PreferenciaDTO;
import co.edu.unbosque.mundial_2026.dto.response.StandingResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Partido;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.PartidoNotFoundException;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.CiudadRepository;
import co.edu.unbosque.mundial_2026.repository.EstadioRepository;
import co.edu.unbosque.mundial_2026.repository.PartidoRepository;
import co.edu.unbosque.mundial_2026.repository.SeleccionRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;

@Service
public class PartidoServiceImpl implements PartidoService {

    private static final int LIGA_MUNDIAL = 1;
    private static final int TEMPORADA_MUNDIAL = 2026;
    private static final String BASE_FIXTURES = "/fixtures?league=" + LIGA_MUNDIAL + "&season=" + TEMPORADA_MUNDIAL;

    private final RestClient footballClient;
    private final PartidoRepository partidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SeleccionRepository seleccionRepository;
    private final EstadioRepository estadioRepository;
    private final CiudadRepository ciudadRepository;
    private static final java.util.Map<String, String> ESTADIO_CIUDAD = new java.util.HashMap<>();

static {
    ESTADIO_CIUDAD.put("Estadio Azteca", "Ciudad de Mexico");
    ESTADIO_CIUDAD.put("Estadio Akron", "Guadalajara");
    ESTADIO_CIUDAD.put("Estadio BBVA", "Monterrey");
    ESTADIO_CIUDAD.put("BMO Field", "Toronto");
    ESTADIO_CIUDAD.put("BC Place", "Vancouver");
    ESTADIO_CIUDAD.put("SoFi Stadium", "Los Angeles");
    ESTADIO_CIUDAD.put("MetLife Stadium", "East Rutherford");
    ESTADIO_CIUDAD.put("Gillette Stadium", "Boston");
    ESTADIO_CIUDAD.put("NRG Stadium", "Houston");
    ESTADIO_CIUDAD.put("Lincoln Financial Field", "Philadelphia");
    ESTADIO_CIUDAD.put("Mercedes-Benz Stadium", "Atlanta");
    ESTADIO_CIUDAD.put("Lumen Field", "Seattle");
    ESTADIO_CIUDAD.put("Hard Rock Stadium", "Miami");
    ESTADIO_CIUDAD.put("Arrowhead Stadium", "Kansas City");
}
    private static final Logger logger = Logger.getLogger(PartidoServiceImpl.class.getName());

    public PartidoServiceImpl(RestClient footballClient, PartidoRepository partidoRepository,
            UsuarioRepository usuarioRepository, SeleccionRepository seleccionRepository,
            EstadioRepository estadioRepository, CiudadRepository ciudadRepository) {
        this.footballClient = footballClient;
        this.partidoRepository = partidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.seleccionRepository = seleccionRepository;
        this.estadioRepository = estadioRepository;
        this.ciudadRepository = ciudadRepository;
    }

    @Override
    public List<PartidoDTO> obtenerPartidos() {
        final PartidoResponseDTO response = footballClient.get()
                .uri(BASE_FIXTURES)
                .retrieve()
                .body(PartidoResponseDTO.class);
        return response.getPartidos();
    }

    @Override
    public List<PartidoDTO> obtenerPartidosPorEquipo(Long equipoId) {
        final PartidoResponseDTO response = footballClient.get()
                .uri(BASE_FIXTURES + "&team=" + equipoId)
                .retrieve()
                .body(PartidoResponseDTO.class);
        return response.getPartidos();
    }

    @Override
    public PartidoDTO obtenerPartidoPorId(Long fixtureId) {
        final PartidoResponseDTO response = footballClient.get()
                .uri("/fixtures?id=" + fixtureId)
                .retrieve()
                .body(PartidoResponseDTO.class);
        if (response.getPartidos() == null || response.getPartidos().isEmpty()) {
            throw new PartidoNotFoundException("Partido no encontrado con id: " + fixtureId);
        }
        return response.getPartidos().get(0);
    }

    @Override
    public List<List<PosicionDTO>> obtenerStandings() {
        final StandingResponseDTO response = footballClient.get()
                .uri("/standings?league=" + LIGA_MUNDIAL + "&season=" + TEMPORADA_MUNDIAL)
                .retrieve()
                .body(StandingResponseDTO.class);
        return response.getRespuesta().get(0).getTablas().getTablas();
    }

    @Override
public List<EquipoMundialDTO> obtenerSelecciones() {
    final EquipoMundialResponseDTO response = footballClient.get()
            .uri("/teams?league=" + LIGA_MUNDIAL + "&season=" + TEMPORADA_MUNDIAL)
            .retrieve()
            .body(EquipoMundialResponseDTO.class);
    return response.getEquipos();
}

    @Override
    public List<JugadorDTO> obtenerJugadoresPorEquipo(Long equipoId) {
        final JugadorResponseDTO response = footballClient.get()
                .uri("/players/squads?team=" + equipoId)
                .retrieve()
                .body(JugadorResponseDTO.class);
        return response.getRespuesta().get(0).getJugadores();
    }

    @Override
    public List<PartidoDTO> obtenerPartidosPorFecha(String fecha) {
        final PartidoResponseDTO response = footballClient.get()
                .uri(BASE_FIXTURES + "&date=" + fecha)
                .retrieve()
                .body(PartidoResponseDTO.class);
        return response.getPartidos();
    }

    @Override
    public List<PartidoDTO> obtenerPartidosEnVivo() {
        final PartidoResponseDTO response = footballClient.get()
                .uri("/fixtures?live=all&league=" + LIGA_MUNDIAL + "&season=" + TEMPORADA_MUNDIAL)
                .retrieve()
                .body(PartidoResponseDTO.class);
        return response.getPartidos();
    }

    @Override
    public int sincronizarDesdeAPI() {
        final PartidoResponseDTO response = footballClient.get()
                .uri(BASE_FIXTURES)
                .retrieve()
                .body(PartidoResponseDTO.class);

        if (response == null || response.getPartidos() == null || response.getPartidos().isEmpty()) {
        logger.warning("La API no devolvió partidos, se omite sincronización.");
        return 0;
    }
        final List<Partido> partidos = response.getPartidos().stream().map(dto -> {
            final Partido partido = new Partido();
            partido.setId(dto.getInformacion().getId());
            partido.setFecha(LocalDateTime.parse(dto.getInformacion().getFecha(),
                    DateTimeFormatter.ISO_OFFSET_DATE_TIME));
            partido.setEstado(dto.getInformacion().getEstado().getCodigo());
            partido.setRonda(dto.getLiga().getRonda());
            partido.setSeleccionLocal(dto.getEquipos().getLocal().getNombre());
            partido.setSeleccionVisitante(dto.getEquipos().getVisitante().getNombre());
            partido.setEstadio(dto.getInformacion().getEstadio().getNombre());
            partido.setGolesLocal(dto.getGoles().getLocal());
            partido.setGolesVisitante(dto.getGoles().getVisitante());
            return partido;
        }).collect(Collectors.toList());

        partidoRepository.saveAll(partidos);
        return partidos.size();
    }

    @Override
    public int sincronizarPorFechaYLiga(String fecha, int liga, int temporada) {
        final PartidoResponseDTO response = footballClient.get()
                .uri("/fixtures?league=" + liga + "&season=" + temporada + "&date=" + fecha)
                .retrieve()
                .body(PartidoResponseDTO.class);

        final List<Partido> partidos = response.getPartidos().stream()
                .map(dto -> procesarPartido(dto))
                .collect(Collectors.toList());

        partidoRepository.saveAll(partidos);
        return partidos.size();
    }

    @Override
    public int actualizarResultado(Long partidoId, int golesLocal, int golesVisitante, int estadoPartido) {
        final Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new PartidoNotFoundException("Partido no encontrado con id: " + partidoId));
        partido.setGolesLocal(golesLocal);
        partido.setGolesVisitante(golesVisitante);
        partido.setEstado(String.valueOf(estadoPartido));
        partidoRepository.save(partido);
        return 1;
    }

    

 @Override
public List<PartidoDTO> obtenerPartidosPorSeleccionesFav(String correo) {
    final Usuario usuario = usuarioRepository.findByCorreoUsuario(correo)
            .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));
    final List<PartidoDTO> listaPartidos = new ArrayList<>();
    for (int i = 0; i < usuario.getSeleccionesU().size(); i++) {
        List<PartidoDTO> partidos = obtenerPartidosPorEquipo(usuario.getSeleccionesU().get(i).getId());
        listaPartidos.addAll(partidos);
    }
    return listaPartidos;
}

    @Override
    public List<PartidoDTO> obtenerPartidosPorEstadiosFav(final String correo) {
        final Usuario usuario = usuarioRepository.findByCorreoUsuario(correo)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));
        final List<PartidoDTO> listaPartidos = new ArrayList<>();
        final PartidoResponseDTO response = footballClient.get()
                .uri(BASE_FIXTURES)
                .retrieve()
                .body(PartidoResponseDTO.class);
        for (int i = 0; i < usuario.getPreferenciasu().size(); i++) {
            final String nombreEstadio = usuario.getPreferenciasu().get(i).getNombre();
            response.getPartidos().stream()
                    .filter(p -> {
                        final String nombre = p.getInformacion().getEstadio().getNombre();
                        return nombre != null && nombre.equalsIgnoreCase(nombreEstadio);
                    })
                    .forEach(p -> listaPartidos.add(p));
        }
        return listaPartidos;
    }

  @Override
public List<PartidoDTO> obtenerPartidosPorCiudadesFav(final String correo) {
    final Usuario usuario = usuarioRepository.findByCorreoUsuario(correo)
            .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));
    final List<PartidoDTO> listaPartidos = new ArrayList<>();
    final PartidoResponseDTO response = footballClient.get()
            .uri(BASE_FIXTURES)
            .retrieve()
            .body(PartidoResponseDTO.class);

    for (int i = 0; i < usuario.getCiudadFavoritas().size(); i++) {
        final String nombreCiudad = usuario.getCiudadFavoritas().get(i).getNombre();
        for (int j = 0; j < response.getPartidos().size(); j++) {
            final String nombreEstadio = response.getPartidos().get(j)
                    .getInformacion().getEstadio().getNombre();
            if (nombreEstadio != null) {
                final String ciudadDelEstadio = ESTADIO_CIUDAD.get(nombreEstadio);
                if (ciudadDelEstadio != null && ciudadDelEstadio.equalsIgnoreCase(nombreCiudad)) {
                    listaPartidos.add(response.getPartidos().get(j));
                }
            }
        }
    }
    return listaPartidos;
}
   

    @Override
    public List<Partido> filtrarPorSeleccion(final String nombre) {
        return partidoRepository.findBySeleccion(nombre);
    }

    @Override
    public List<Partido> filtrarPorEstadio(final String nombre) {
        return partidoRepository.findByEstadio(nombre);
    }

    @Override
    public List<Partido> filtrarPorCiudad(final String nombre) {
        return partidoRepository.findAll().stream()
                .filter(p -> {
                    final String ciudadDelEstadio = ESTADIO_CIUDAD.get(p.getEstadio());
                    return ciudadDelEstadio != null && ciudadDelEstadio.equalsIgnoreCase(nombre);
                })
                .collect(Collectors.toList());
    }

    private Partido procesarPartido(final PartidoDTO dto) {
        final Long partidoId = dto.getInformacion().getId();
        final Partido partido = partidoRepository.findById(partidoId).orElse(new Partido());
        partido.setId(partidoId);
        partido.setFecha(LocalDateTime.parse(dto.getInformacion().getFecha(),
                DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        partido.setEstado(dto.getInformacion().getEstado().getCodigo());
        partido.setRonda(dto.getLiga().getRonda());
        partido.setSeleccionLocal(dto.getEquipos().getLocal().getNombre());
        partido.setSeleccionVisitante(dto.getEquipos().getVisitante().getNombre());
        partido.setEstadio(dto.getInformacion().getEstadio().getNombre());
         if (dto.getGoles() != null) {
        partido.setGolesLocal(dto.getGoles().getLocal());
        partido.setGolesVisitante(dto.getGoles().getVisitante());
    }
        return partido;
    }
    @Override
public List<PreferenciaDTO> obtenerCatalogoSelecciones() {
    return seleccionRepository.findAll().stream()
        .map(s -> new PreferenciaDTO(s.getId(), s.getNombre()))
        .toList();
}
}