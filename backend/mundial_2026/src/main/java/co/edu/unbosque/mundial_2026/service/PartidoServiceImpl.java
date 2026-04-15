package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import co.edu.unbosque.mundial_2026.dto.response.EquipoConEstadioDTO;
import co.edu.unbosque.mundial_2026.dto.response.EquipoResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.JugadorDTO;
import co.edu.unbosque.mundial_2026.dto.response.JugadorResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.PosicionDTO;
import co.edu.unbosque.mundial_2026.dto.response.StandingResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Partido;
import co.edu.unbosque.mundial_2026.exception.PartidoNotFoundException;
import co.edu.unbosque.mundial_2026.repository.PartidoRepository;

@Service
public class PartidoServiceImpl implements PartidoService {

    private static final int LIGA_MUNDIAL = 1;
    private static final int TEMPORADA_MUNDIAL = 2026;
    private static final String BASE_FIXTURES = "/fixtures?league=" + LIGA_MUNDIAL + "&season=" + TEMPORADA_MUNDIAL;

    private final RestClient footballClient;
    private final PartidoRepository partidoRepository;

    public PartidoServiceImpl(RestClient footballClient, PartidoRepository partidoRepository) {
        this.footballClient = footballClient;
        this.partidoRepository = partidoRepository;
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
    public List<EquipoConEstadioDTO> obtenerSelecciones() {
        final EquipoResponseDTO response = footballClient.get()
                .uri("/teams?league=" + LIGA_MUNDIAL + "&season=" + TEMPORADA_MUNDIAL)
                .retrieve()
                .body(EquipoResponseDTO.class);
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

    private Partido procesarPartido(final PartidoDTO dto) {
        final String estadoNuevo = dto.getInformacion().getEstado().getCodigo();
        final Long partidoId = dto.getInformacion().getId();

        final Partido partido = partidoRepository.findById(partidoId)
                .orElse(new Partido());

        partido.setId(partidoId);
        partido.setFecha(LocalDateTime.parse(dto.getInformacion().getFecha(),
                DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        partido.setEstado(estadoNuevo);
        partido.setRonda(dto.getLiga().getRonda());
        partido.setSeleccionLocal(dto.getEquipos().getLocal().getNombre());
        partido.setSeleccionVisitante(dto.getEquipos().getVisitante().getNombre());
        partido.setEstadio(dto.getInformacion().getEstadio().getNombre());
        partido.setGolesLocal(dto.getGoles().getLocal());
        partido.setGolesVisitante(dto.getGoles().getVisitante());

        return partido;
    }
}