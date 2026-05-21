package co.edu.unbosque.mundial_2026.dto;

import java.time.LocalDateTime;

public class ApuestaDTO {

    private Long id;
    private String nombre;
    private String estado;
    private String codigoInvitacion;
    private LocalDateTime fechaCierre;
    private Long creadoPor;

    public ApuestaDTO() {
    }

    public ApuestaDTO(Long id, String nombre, String estado, String codigoInvitacion,
            LocalDateTime fechaCierre, Long creadoPor) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
        this.codigoInvitacion = codigoInvitacion;
        this.fechaCierre = fechaCierre;
        this.creadoPor = creadoPor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getCodigoInvitacion() {
        return codigoInvitacion;
    }

    public void setCodigoInvitacion(String codigoInvitacion) {
        this.codigoInvitacion = codigoInvitacion;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public Long getCreadoPor() {
        return creadoPor;
    }

    public void setCreadoPor(Long creadoPor) {
        this.creadoPor = creadoPor;
    }
}