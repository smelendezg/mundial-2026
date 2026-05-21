package co.edu.unbosque.mundial_2026.dto;

import java.time.LocalDateTime;

public class EventoAuditoriaDTO {

    private Long id;
    private String tipo;
    private String descripcion;
    private LocalDateTime fecha;
    private String idCorrelacion;
    private String entidadCorrelacion;
    private Long usuarioId;

    public EventoAuditoriaDTO() {
    }

    public EventoAuditoriaDTO(Long id, String tipo, String descripcion, LocalDateTime fecha,
            String idCorrelacion, String entidadCorrelacion, Long usuarioId) {
        this.id = id;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.idCorrelacion = idCorrelacion;
        this.entidadCorrelacion = entidadCorrelacion;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getIdCorrelacion() {
        return idCorrelacion;
    }

    public void setIdCorrelacion(String idCorrelacion) {
        this.idCorrelacion = idCorrelacion;
    }

    public String getEntidadCorrelacion() {
        return entidadCorrelacion;
    }

    public void setEntidadCorrelacion(String entidadCorrelacion) {
        this.entidadCorrelacion = entidadCorrelacion;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}