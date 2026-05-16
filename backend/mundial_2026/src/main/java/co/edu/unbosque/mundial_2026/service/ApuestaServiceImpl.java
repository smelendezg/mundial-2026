package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unbosque.mundial_2026.dto.ApuestaDTO;
import co.edu.unbosque.mundial_2026.dto.ParticipacionDTO;
import co.edu.unbosque.mundial_2026.dto.PronosticoDTO;
import co.edu.unbosque.mundial_2026.dto.request.ApuestaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO;
import co.edu.unbosque.mundial_2026.entity.Apuesta;
import co.edu.unbosque.mundial_2026.entity.Participacion;
import co.edu.unbosque.mundial_2026.entity.Partido;
import co.edu.unbosque.mundial_2026.entity.Pronostico;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.ApuestaCerradaException;
import co.edu.unbosque.mundial_2026.exception.ApuestaNotFoundException;
import co.edu.unbosque.mundial_2026.exception.CodigoInvalidoException;
import co.edu.unbosque.mundial_2026.exception.EstadoInvalidoException;
import co.edu.unbosque.mundial_2026.exception.ParticipacionNotFoundException;
import co.edu.unbosque.mundial_2026.exception.PronosticoNotFoundException;
import co.edu.unbosque.mundial_2026.exception.UsuarioYaEnApuestaException;
import co.edu.unbosque.mundial_2026.repository.ApuestaRepository;
import co.edu.unbosque.mundial_2026.repository.ParticipacionRepository;
import co.edu.unbosque.mundial_2026.repository.PronosticoRepository;


@Service
public class ApuestaServiceImpl implements ApuestaService {

    private final ApuestaRepository apuestaRepository;
    private final PronosticoRepository pronosticoRepository;
    private final ParticipacionRepository participacionRepository;
     private final UsuarioService usuarioService;
     private static final String ESTADO_ABIERTA = "ABIERTA";
private static final String ESTADO_CERRADA = "CERRADA";
private static final String APUESTA_NO_ENCONTRADA = "Apuesta no encontrada";
private static final String PRONOSTICO_NO_ENCONTRADO = "Pronostico no encontrado";
   
    private final PartidoService partidoService;
 public ApuestaServiceImpl(ApuestaRepository apuestaRepository, PronosticoRepository pronosticoRepository,
                ParticipacionRepository participacionRepository, UsuarioService usuarioService,
                PartidoService partidoService) {
        this.apuestaRepository = apuestaRepository;
        this.pronosticoRepository = pronosticoRepository;
        this.participacionRepository = participacionRepository;
        this.usuarioService = usuarioService;
        this.partidoService = partidoService;
}
   
    // EventoAuditoriaService pendiente de migrar

    @Transactional
    @Override
    public ApuestaDTO crearApuesta(ApuestaRequestDTO dto) {
      final Usuario usuario = usuarioService.obtenerEntidadPorId(dto.getUsuarioId());

        final Apuesta apuesta = new Apuesta();
        apuesta.setNombre(dto.getNombre());
        apuesta.setFechaCierre(dto.getFechaCierre());
        apuesta.setCreadaPor(usuario);
        apuesta.setEstado(ESTADO_ABIERTA);
        apuesta.setCodigoInvitacion(UUID.randomUUID().toString());
        apuestaRepository.save(apuesta);

        final Participacion partCreador = new Participacion();
        partCreador.setUsuario(usuario);
        partCreador.setApuesta(apuesta);
        partCreador.setPuntos(0);
        participacionRepository.save(partCreador);

        // eventoAuditoriaService.registrar(...) // pendiente

        final Long creadoPorId = apuesta.getCreadaPor().getId();
        return new ApuestaDTO(apuesta.getId(), apuesta.getNombre(), apuesta.getEstado(),
                apuesta.getCodigoInvitacion(), apuesta.getFechaCierre(), creadoPorId);
    }
@Transactional
    @Override
    public PronosticoDTO registrarPronostico(PronosticoRequestDTO dto) {
    final Usuario usuario = usuarioService.obtenerEntidadPorId(dto.getUsuarioId());
        final Apuesta apuesta = apuestaRepository.findById(dto.getApuestaId())
                .orElseThrow(() -> new ApuestaNotFoundException(APUESTA_NO_ENCONTRADA));

        if (!ESTADO_ABIERTA.equalsIgnoreCase(apuesta.getEstado())) {
    throw new ApuestaCerradaException("La apuesta no está abierta para pronósticos"); // ← cambio
}

        participacionRepository.findByUsuarioIdAndApuestaId(usuario.getId(), apuesta.getId())
                .orElseThrow(() -> new ParticipacionNotFoundException("Usuario no pertenece a la polla"));

      final Partido partido = partidoService.obtenerPartidoEntidadPorId(dto.getPartidoId());
        final Pronostico pronostico = new Pronostico();
        pronostico.setResultadoPronosticado(dto.getResultadoPronosticado());
        pronostico.setGolesLocalPronosticados(dto.getGolesLocalPronosticados());
        pronostico.setGolesVisitantePronosticados(dto.getGolesVisitantePronosticados());
        pronostico.setUsuario(usuario);
        pronostico.setApuesta(apuesta);
        pronostico.setPartido(partido);
        pronostico.setPuntosObtenidos(0);
        pronosticoRepository.save(pronostico);

        // eventoAuditoriaService.registrar(...) // pendiente

        return new PronosticoDTO(pronostico.getId(), pronostico.getResultadoPronosticado(),
                pronostico.getGolesLocalPronosticados(), pronostico.getGolesVisitantePronosticados(),
                pronostico.getPuntosObtenidos(), pronostico.getUsuario().getId(),
                pronostico.getApuesta().getId(), pronostico.getPartido().getId());
    }
    
@Transactional
    @Override
    public ApuestaDTO unirseApuesta(String codigo, Long usuarioId) {
     final Usuario usuario = usuarioService.obtenerEntidadPorId(usuarioId);
        final Apuesta apuesta = apuestaRepository.findByCodigoInvitacion(codigo)
                .orElseThrow(() -> new CodigoInvalidoException("Codigo no coincide"));

        participacionRepository.findByUsuarioIdAndApuestaId(usuario.getId(), apuesta.getId())
                .ifPresent(p -> { throw new UsuarioYaEnApuestaException("Usuario ya está en la polla"); });

        final Participacion participacion = new Participacion();
        participacion.setUsuario(usuario);
        participacion.setApuesta(apuesta);
        participacion.setPuntos(0);
        participacionRepository.save(participacion);

        // eventoAuditoriaService.registrar(...) // pendiente

        final Long creadoPorId = apuesta.getCreadaPor().getId();
        return new ApuestaDTO(apuesta.getId(), apuesta.getNombre(), apuesta.getEstado(),
                apuesta.getCodigoInvitacion(), apuesta.getFechaCierre(), creadoPorId);
    }
@Transactional(readOnly = true)
    @Override
    public List<ParticipacionDTO> obtenerRanking(Long apuestaId) {
        return participacionRepository.findByApuestaIdOrderByPuntosDesc(apuestaId).stream()
                .map(p -> new ParticipacionDTO(p.getId(), p.getUsuario().getId(),
                        p.getApuesta().getId(), p.getPuntos(), p.getPosicionRanking()))
                .toList();
    }
@Transactional
    @Override
    public List<PronosticoDTO> calcularPuntos(Long apuestaId) {
        final Apuesta apuesta = apuestaRepository.findById(apuestaId)
                .orElseThrow(() -> new ApuestaNotFoundException("La apuesta no existe"));

     if (!ESTADO_CERRADA.equalsIgnoreCase(apuesta.getEstado())) {
    throw new EstadoInvalidoException("La apuesta debe estar cerrada para calcular puntos"); // ← cambio
}

        final List<Participacion> participaciones = participacionRepository.findByApuestaId(apuestaId);
        for (final Participacion p : participaciones) {
            p.setPuntos(0);
            participacionRepository.save(p);
        }

        final List<Pronostico> pronosticos = pronosticoRepository.findByApuestaId(apuestaId);
        pronosticos.stream()
                .map(p -> p.getPartido().getFecha().toLocalDate().toString())
                .distinct()
                .forEach(fecha -> partidoService.sincronizarPorFechaYLiga(fecha, 1, 2026));

        final List<PronosticoDTO> resultado = new ArrayList<>();
        for (final Pronostico pronostico : pronosticoRepository.findByApuestaId(apuestaId)) {
            final Partido partido = pronostico.getPartido();
            if (partido.getGolesLocal() == null || partido.getGolesVisitante() == null) continue;

            final String resultadoReal = determinarResultado(partido);
            final int puntos = calcularPuntosPronostico(partido, pronostico, resultadoReal);

            pronostico.setPuntosObtenidos(puntos);
            pronosticoRepository.save(pronostico);

            final Participacion participacion = participacionRepository
                    .findByUsuarioIdAndApuestaId(pronostico.getUsuario().getId(), apuestaId)
                    .orElseThrow(() ->  new ParticipacionNotFoundException("Participacion no encontrada"));
            participacion.setPuntos(puntos + participacion.getPuntos());
            participacionRepository.save(participacion);

            resultado.add(new PronosticoDTO(pronostico.getId(), pronostico.getResultadoPronosticado(),
                    pronostico.getGolesLocalPronosticados(), pronostico.getGolesVisitantePronosticados(),
                    pronostico.getPuntosObtenidos(), pronostico.getUsuario().getId(),
                    pronostico.getApuesta().getId(), pronostico.getPartido().getId()));
        }

        int posicion = 1;
        for (final Participacion p : participacionRepository.findByApuestaIdOrderByPuntosDesc(apuestaId)) {
            p.setPosicionRanking(posicion++);
            participacionRepository.save(p);
        }

        // eventoAuditoriaService.registrar(...) // pendiente

        return resultado;
    }

    private String determinarResultado(final Partido partido) {
        if (partido.getGolesLocal() > partido.getGolesVisitante()) return "LOCAL";
        else if (partido.getGolesLocal() < partido.getGolesVisitante()) return "VISITANTE";
        else return "EMPATE";
    }

    private int calcularPuntosPronostico(final Partido partido, final Pronostico pronostico,
            final String resultadoReal) {
        int puntos = 0;
        if (pronostico.getGolesLocalPronosticados().equals(partido.getGolesLocal())
                && pronostico.getGolesVisitantePronosticados().equals(partido.getGolesVisitante())) puntos += 3;
        if (pronostico.getResultadoPronosticado().equals(resultadoReal)) puntos += 2;
        if ((pronostico.getGolesLocalPronosticados() + pronostico.getGolesVisitantePronosticados())
                == (partido.getGolesLocal() + partido.getGolesVisitante())) puntos += 1;
        return puntos;
    }
@Transactional
    @Override
    public ApuestaDTO cerrarApuesta(Long apuestaId) {
        final Apuesta apuesta = apuestaRepository.findById(apuestaId)
                .orElseThrow(() -> new ApuestaNotFoundException(APUESTA_NO_ENCONTRADA));
     if (!ESTADO_ABIERTA.equalsIgnoreCase(apuesta.getEstado())) {
    throw new ApuestaCerradaException("La apuesta ya no está abierta"); 
}
        apuesta.setEstado(ESTADO_CERRADA);
        apuestaRepository.save(apuesta);
        // eventoAuditoriaService.registrar(...) // pendiente
        return new ApuestaDTO(apuesta.getId(), apuesta.getNombre(), apuesta.getEstado(),
                apuesta.getCodigoInvitacion(), apuesta.getFechaCierre(), apuesta.getCreadaPor().getId());
    }
@Transactional(readOnly = true)
    @Override
    public ApuestaDTO obtenerApuesta(Long apuestaId) {
        final Apuesta apuesta = apuestaRepository.findById(apuestaId)
                .orElseThrow(() -> new ApuestaNotFoundException(APUESTA_NO_ENCONTRADA));
        return new ApuestaDTO(apuesta.getId(), apuesta.getNombre(), apuesta.getEstado(),
                apuesta.getCodigoInvitacion(), apuesta.getFechaCierre(), apuesta.getCreadaPor().getId());
    }

   
@Transactional(readOnly = true)
    @Override
    public List<ParticipacionDTO> listarParticipantes(Long apuestaId) {
        return participacionRepository.findByApuestaId(apuestaId).stream()
                .map(p -> new ParticipacionDTO(p.getId(), p.getUsuario().getId(),
                        p.getApuesta().getId(), p.getPuntos(), p.getPosicionRanking()))
                .toList();
    }
    @Override
public List<ApuestaDTO> listarApuestasPorUsuario(Long usuarioId) {
    return participacionRepository.findByUsuarioId(usuarioId).stream()
            .map(participacion -> {
                final Apuesta apuesta = participacion.getApuesta();
                return new ApuestaDTO(
                        apuesta.getId(),
                        apuesta.getNombre(),
                        apuesta.getEstado(),
                        apuesta.getCodigoInvitacion(),
                        apuesta.getFechaCierre(),
                        apuesta.getCreadaPor().getId());
            })
            .toList();
}
@Transactional(readOnly = true)
    @Override
    public PronosticoDTO verificarPronostico(Long pronosticoId) {
        final Pronostico pronostico = pronosticoRepository.findById(pronosticoId)
                .orElseThrow(() -> new PronosticoNotFoundException(PRONOSTICO_NO_ENCONTRADO));
        return new PronosticoDTO(pronostico.getId(), pronostico.getResultadoPronosticado(),
                pronostico.getGolesLocalPronosticados(), pronostico.getGolesVisitantePronosticados(),
                pronostico.getPuntosObtenidos(), pronostico.getUsuario().getId(),
                pronostico.getApuesta().getId(), pronostico.getPartido().getId());
    }
@Transactional
    @Override
    public void calcularPuntosAutomatico() {
        apuestaRepository.findByEstado(ESTADO_CERRADA)
                .forEach(apuesta -> calcularPuntos(apuesta.getId()));
    }
@Transactional
    @Override
    public void cerrarApuestasVencidas() {
        apuestaRepository.findByEstadoAndFechaCierreBefore(ESTADO_ABIERTA, LocalDateTime.now().plusMinutes(5))
                .forEach(apuesta -> cerrarApuesta(apuesta.getId()));
    }
    @Transactional(readOnly = true)
    @Override
public List<PronosticoDTO> misPronosticos(Long apuestaId, Long usuarioId) {
    return pronosticoRepository.findByApuestaIdAndUsuarioId(apuestaId, usuarioId).stream()
            .map(p -> new PronosticoDTO(
                    p.getId(),
                    p.getResultadoPronosticado(),
                    p.getGolesLocalPronosticados(),
                    p.getGolesVisitantePronosticados(),
                    p.getPuntosObtenidos(),
                    p.getUsuario().getId(),
                    p.getApuesta().getId(),
                    p.getPartido().getId()))
            .toList();
}
@Transactional
@Override
public PronosticoDTO editarPronostico(Long pronosticoId, PronosticoRequestDTO dto) {
    final Pronostico pronostico = pronosticoRepository.findById(pronosticoId)
            .orElseThrow(() -> new PronosticoNotFoundException(PRONOSTICO_NO_ENCONTRADO));

    final Apuesta apuesta = pronostico.getApuesta();
    if (!ESTADO_ABIERTA.equalsIgnoreCase(apuesta.getEstado())) {
        throw new ApuestaCerradaException("No se puede editar un pronóstico de una polla cerrada");
    }

    final String resultadoPronosticado = dto.getResultadoPronosticado() != null
            ? dto.getResultadoPronosticado()
            : pronostico.getResultadoPronosticado();

    pronostico.setGolesLocalPronosticados(dto.getGolesLocalPronosticados());
    pronostico.setGolesVisitantePronosticados(dto.getGolesVisitantePronosticados());
    pronostico.setResultadoPronosticado(resultadoPronosticado);
    pronosticoRepository.save(pronostico);

    return new PronosticoDTO(
            pronostico.getId(),
            pronostico.getResultadoPronosticado(),
            pronostico.getGolesLocalPronosticados(),
            pronostico.getGolesVisitantePronosticados(),
            pronostico.getPuntosObtenidos(),
            pronostico.getUsuario().getId(),
            pronostico.getApuesta().getId(),
            pronostico.getPartido().getId());
}
@Transactional
@Override
public void eliminarPronostico(Long pronosticoId) {
    final Pronostico pronostico = pronosticoRepository.findById(pronosticoId)
            .orElseThrow(() -> new PronosticoNotFoundException(PRONOSTICO_NO_ENCONTRADO));

    final Apuesta apuesta = pronostico.getApuesta();
    if (!ESTADO_ABIERTA.equalsIgnoreCase(apuesta.getEstado())) {
        throw new ApuestaCerradaException("No se puede editar un pronóstico de una polla cerrada");
    }

    pronosticoRepository.delete(pronostico);
}
@Transactional
@Override
public List<PronosticoDTO> calcularPuntosParciales(Long apuestaId) {
    apuestaRepository.findById(apuestaId)
            .orElseThrow(() -> new ApuestaNotFoundException(APUESTA_NO_ENCONTRADA));

    // resetear puntos
    final List<Participacion> participaciones = participacionRepository.findByApuestaId(apuestaId);
    for (final Participacion p : participaciones) {
        p.setPuntos(0);
        participacionRepository.save(p);
    }

    final List<Pronostico> pronosticos = pronosticoRepository.findByApuestaId(apuestaId);
    final List<PronosticoDTO> resultado = new ArrayList<>();

    for (final Pronostico pronostico : pronosticos) {
        final Partido partido = pronostico.getPartido();

        // solo partidos ya terminados con resultado real
        if (partido.getGolesLocal() == null || partido.getGolesVisitante() == null) {
            continue;
        }

        final String resultadoReal = determinarResultado(partido);
        final int puntos = calcularPuntosPronostico(partido, pronostico, resultadoReal);

        pronostico.setPuntosObtenidos(puntos);
        pronosticoRepository.save(pronostico);

        final Participacion participacion = participacionRepository
                .findByUsuarioIdAndApuestaId(pronostico.getUsuario().getId(), apuestaId)
                .orElseThrow(() -> new ParticipacionNotFoundException("Participacion no encontrada"));
        participacion.setPuntos(puntos + participacion.getPuntos());
        participacionRepository.save(participacion);

        resultado.add(new PronosticoDTO(
                pronostico.getId(),
                pronostico.getResultadoPronosticado(),
                pronostico.getGolesLocalPronosticados(),
                pronostico.getGolesVisitantePronosticados(),
                pronostico.getPuntosObtenidos(),
                pronostico.getUsuario().getId(),
                pronostico.getApuesta().getId(),
                pronostico.getPartido().getId()));
    }

    // actualizar ranking parcial
    int posicion = 1;
    for (final Participacion p : participacionRepository.findByApuestaIdOrderByPuntosDesc(apuestaId)) {
        p.setPosicionRanking(posicion++);
        participacionRepository.save(p);
    }

    return resultado;
}
@Transactional(readOnly = true)
@Override
public List<ApuestaDTO> listarTodas() {
    List<Apuesta> apuestas = apuestaRepository.findAll();
    List<ApuestaDTO> resultado = new ArrayList<>();
    for (int i = 0; i < apuestas.size(); i++) {
        Apuesta a = apuestas.get(i);
        resultado.add(new ApuestaDTO(a.getId(), a.getNombre(), a.getEstado(),
                a.getCodigoInvitacion(), a.getFechaCierre(), a.getCreadaPor().getId()));
    }
    return resultado;
}
@Transactional
@Override
public void eliminarApuesta(Long apuestaId) {
    Apuesta apuesta = apuestaRepository.findById(apuestaId)
        .orElseThrow(() -> new ApuestaNotFoundException(APUESTA_NO_ENCONTRADA)); 
    pronosticoRepository.deleteByApuestaId(apuestaId);
    participacionRepository.deleteByApuestaId(apuestaId);
    apuestaRepository.delete(apuesta);
}
}