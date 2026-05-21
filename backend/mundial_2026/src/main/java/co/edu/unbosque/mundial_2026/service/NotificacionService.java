package co.edu.unbosque.mundial_2026.service;

import java.util.List;

import co.edu.unbosque.mundial_2026.dto.NotificacionDTO;
import co.edu.unbosque.mundial_2026.dto.request.NotificacionMasivaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.NotificacionRequestDTO;
import co.edu.unbosque.mundial_2026.entity.Usuario;

public interface NotificacionService {

    void enviarNotificacion(NotificacionRequestDTO dto);

    void enviarMasiva(NotificacionMasivaRequestDTO dto);

    List<NotificacionDTO> listarPorUsuario(Long usuarioId);

    void marcarLeida(Long notificacionId);

    void marcarTodasLeidas(Long usuarioId);

    void notificarPorPartido(Long partidoId, String tipo, String titulo, String mensaje);

    void notificarRegistro(Usuario usuario);

    void notificarActualizacionPerfil(Usuario usuario);
}