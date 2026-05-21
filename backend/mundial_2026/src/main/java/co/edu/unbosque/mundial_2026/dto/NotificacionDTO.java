package co.edu.unbosque.mundial_2026.dto;

import java.time.LocalDateTime;

public class NotificacionDTO {

    private Long id;
    private String tipo;
    private String titulo;
    private String mensaje;
    private String canal;
    private String estado;
    private boolean leida;
    private LocalDateTime fecha;
    private Long usuarioId;

    public NotificacionDTO() {
    }

    public NotificacionDTO(Long id, String tipo, String titulo, String mensaje,
            String canal, String estado, boolean leida, LocalDateTime fecha, Long usuarioId) {
        this.id = id;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.canal = canal;
        this.estado = estado;
        this.leida = leida;
        this.fecha = fecha;
        this.usuarioId = usuarioId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getCanal() {
        return canal;
    }

    public void setCanal(String canal) {
        this.canal = canal;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public boolean isLeida() {
        return leida;
    }

    public void setLeida(boolean leida) {
        this.leida = leida;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}