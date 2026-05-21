package co.edu.unbosque.mundial_2026.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import co.edu.unbosque.mundial_2026.dto.NotificacionDTO;
import co.edu.unbosque.mundial_2026.dto.request.NotificacionMasivaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.NotificacionRequestDTO;
import co.edu.unbosque.mundial_2026.entity.Notificacion;
import co.edu.unbosque.mundial_2026.entity.Partido;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.PartidoNotFoundException;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.NotificacionRepository;
import co.edu.unbosque.mundial_2026.repository.PartidoRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;

@Service
public class NotificacionServiceImpl implements NotificacionService {

    private static final String ESTADO_ENVIADA = "ENVIADA";
    private static final String CANAL_SISTEMA = "SISTEMA";
    private static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado";
private static final String TIPO_NOTIFICACION = "NOTIFICACION";

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final PartidoRepository partidoRepository;
    private final EventoAuditoriaService eventoAuditoriaService;

    public NotificacionServiceImpl(NotificacionRepository notificacionRepository,
            UsuarioRepository usuarioRepository,
            PartidoRepository partidoRepository,
            EventoAuditoriaService eventoAuditoriaService) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.partidoRepository = partidoRepository;
        this.eventoAuditoriaService = eventoAuditoriaService;
    }

    @Override
    @Transactional
    public void enviarNotificacion(NotificacionRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        Notificacion notificacion = new Notificacion(
                dto.getTipo(), dto.getTitulo(), dto.getMensaje(),
                dto.getCanal(), ESTADO_ENVIADA, usuario);
        notificacionRepository.save(notificacion);
        enviarPush(usuario, dto.getTitulo(), dto.getMensaje());
        eventoAuditoriaService.registrar(
                "NOTIFICACION_ENVIADA",
                "Se envió notificación tipo " + dto.getTipo() + " al usuario " + usuario.getCorreoUsuario(),
                usuario.getId(), UUID.randomUUID().toString(), TIPO_NOTIFICACION);
    }

    @Override
    @Transactional
    public void enviarMasiva(NotificacionMasivaRequestDTO dto) {
        List<Usuario> destinatarios;

        if (dto.getUsuarioIds() == null || dto.getUsuarioIds().isEmpty()) {
            destinatarios = usuarioRepository.findAll()
                    .stream()
                    .filter(Usuario::isActivo)
                    .toList();
        } else {
            destinatarios = usuarioRepository.findAllById(dto.getUsuarioIds())
                    .stream()
                    .filter(Usuario::isActivo)
                    .toList();
        }

        List<Notificacion> notificaciones = new ArrayList<>();
        for (Usuario usuario : destinatarios) {
            notificaciones.add(new Notificacion(
                    dto.getTipo(), dto.getTitulo(), dto.getMensaje(),
                    dto.getCanal(), ESTADO_ENVIADA, usuario));
            enviarPush(usuario, dto.getTitulo(), dto.getMensaje());
        }

        notificacionRepository.saveAll(notificaciones);
        eventoAuditoriaService.registrar(
                "NOTIFICACION_MASIVA",
                "Notificación masiva enviada a " + destinatarios.size() + " usuarios",
                null, UUID.randomUUID().toString(), TIPO_NOTIFICACION);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionDTO> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        List<Notificacion> lista = notificacionRepository.findByUsuario(usuario);
        List<NotificacionDTO> resultado = new ArrayList<>();
        for (Notificacion n : lista) {
            resultado.add(toDTO(n));
        }
        return resultado;
    }

    @Override
    @Transactional
    public void marcarLeida(Long notificacionId) {
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }

    @Override
    @Transactional
    public void marcarTodasLeidas(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNotFoundException(USUARIO_NO_ENCONTRADO));
        List<Notificacion> lista = notificacionRepository.findByUsuario(usuario);
        for (Notificacion n : lista) {
            n.setLeida(true);
        }
        notificacionRepository.saveAll(lista);
    }

    @Override
    @Transactional
    public void notificarPorPartido(Long partidoId, String tipo, String titulo, String mensaje) {
        Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new PartidoNotFoundException("Partido no encontrado"));

        List<String> selecciones = new ArrayList<>();
        selecciones.add(partido.getSeleccionLocal());
        selecciones.add(partido.getSeleccionVisitante());

        List<Usuario> todosActivos = usuarioRepository.findAll()
                .stream()
                .filter(Usuario::isActivo)
                .toList();

        List<Usuario> destinatarios = todosActivos.stream()
                .filter(u -> u.getSeleccionesU() != null &&
                        u.getSeleccionesU().stream()
                                .anyMatch(s -> selecciones.contains(s.getNombre())))
                .toList();

        List<Notificacion> notificaciones = new ArrayList<>();
        for (Usuario usuario : destinatarios) {
            notificaciones.add(new Notificacion(tipo, titulo, mensaje, CANAL_SISTEMA, ESTADO_ENVIADA, usuario));
            enviarPush(usuario, titulo, mensaje);
        }

        notificacionRepository.saveAll(notificaciones);
        eventoAuditoriaService.registrar(
                "NOTIFICACION_POR_PARTIDO",
                "Se notificó a " + destinatarios.size() + " usuarios por el partido " + partidoId,
                null, UUID.randomUUID().toString(), TIPO_NOTIFICACION);
    }

    @Override
    @Transactional
    public void notificarRegistro(Usuario usuario) {
        Notificacion notificacion = new Notificacion(
                CANAL_SISTEMA,
                "Bienvenido(a) a Mundial 2026 Hub",
                "Tu cuenta ha sido creada exitosamente.",
                CANAL_SISTEMA, ESTADO_ENVIADA, usuario);
        notificacionRepository.save(notificacion);
        enviarPush(usuario, "Bienvenido(a) a Mundial 2026 Hub", "Tu cuenta ha sido creada exitosamente.");
        eventoAuditoriaService.registrar(
                "NOTIFICACION_REGISTRO",
                "Se envió notificación de bienvenida al usuario " + usuario.getCorreoUsuario(),
                usuario.getId(), UUID.randomUUID().toString(), TIPO_NOTIFICACION);
    }

    @Override
    @Transactional
    public void notificarActualizacionPerfil(Usuario usuario) {
        Notificacion notificacion = new Notificacion(
                CANAL_SISTEMA,
                "Perfil actualizado",
                "Tu perfil ha sido actualizado exitosamente.",
                CANAL_SISTEMA, ESTADO_ENVIADA, usuario);
        notificacionRepository.save(notificacion);
        enviarPush(usuario, "Perfil actualizado", "Tu perfil ha sido actualizado exitosamente.");
        eventoAuditoriaService.registrar(
                "NOTIFICACION_PERFIL_ACTUALIZADO",
                "Se envió notificación de perfil actualizado al usuario " + usuario.getCorreoUsuario(),
                usuario.getId(), UUID.randomUUID().toString(), TIPO_NOTIFICACION);
    }

private void enviarPush(Usuario usuario, String titulo, String mensaje) {
    if (usuario.getFcmtoken() == null || usuario.getFcmtoken().isBlank()) {
        return;
    }
    try {
        Message message = Message.builder()
                .setToken(usuario.getFcmtoken())
                .setNotification(Notification.builder()
                        .setTitle(titulo)
                        .setBody(mensaje)
                        .build())
                .build();
        FirebaseMessaging.getInstance().send(message);
        eventoAuditoriaService.registrar(
                "PUSH_FCM_EXITOSO",
                "Push enviado correctamente a " + usuario.getCorreoUsuario(),
                usuario.getId(), UUID.randomUUID().toString(), TIPO_NOTIFICACION);
    } catch (FirebaseMessagingException e) {
        eventoAuditoriaService.registrar(
                "PUSH_FCM_FALLIDO",
                "Error al enviar push a " + usuario.getCorreoUsuario() + ": " + e.getMessage(),
                usuario.getId(), UUID.randomUUID().toString(), TIPO_NOTIFICACION);
    }
}

    private NotificacionDTO toDTO(Notificacion n) {
        return new NotificacionDTO(
                n.getId(), n.getTipo(), n.getTitulo(), n.getMensaje(),
                n.getCanal(), n.getEstado(), n.isLeida(), n.getFecha(),
                n.getUsuario().getId());
    }
}