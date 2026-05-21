package co.edu.unbosque.mundial_2026.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "eventos_auditoria")
public class EventoAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false, columnDefinition = "TEXT")
private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(name = "id_correlacion")
    private String idCorrelacion;

    @Column(name = "entidad_correlacion")
    private String entidadCorrelacion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = true)
    private Usuario usuario;

    public EventoAuditoria() {
        //Constructor vacio
    }

    public EventoAuditoria(String tipo, String descripcion, LocalDateTime fecha,
            String idCorrelacion, String entidadCorrelacion, Usuario usuario) {
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.idCorrelacion = idCorrelacion;
        this.entidadCorrelacion = entidadCorrelacion;
        this.usuario = usuario;
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}