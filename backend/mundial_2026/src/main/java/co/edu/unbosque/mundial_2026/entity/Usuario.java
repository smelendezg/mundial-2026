package co.edu.unbosque.mundial_2026.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "usuarios")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Usuario {

    private static final String USUARIO_ID = "usuario_id";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", unique = true, nullable = false)
    @NotBlank
    private String correoUsuario;

    @Column(name = "contrasena", nullable = false)
    @NotBlank
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String contrasena;

    @Column(name = "nombre_usuario", nullable = false)
    private String nombre;

    @Column(name = "apellido_usuario", nullable = false)
    private String apellido;

    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @ManyToMany
    @JoinTable(name = "usuarios_selecciones", joinColumns = @JoinColumn(name = USUARIO_ID), inverseJoinColumns = @JoinColumn(name = "seleccion_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            USUARIO_ID, "seleccion_id" }))
    private List<Seleccion> seleccionesU;

    @ManyToMany
    @JoinTable(name = "usuarios_preferenciasUbi", joinColumns = @JoinColumn(name = USUARIO_ID), inverseJoinColumns = @JoinColumn(name = "estadio_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            USUARIO_ID, "estadio_id" }))
    private List<EstadioFavorito> preferenciasu;

    @ManyToMany
    @JoinTable(joinColumns = @JoinColumn(name = USUARIO_ID), inverseJoinColumns = @JoinColumn(name = "ciudad_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            USUARIO_ID, "ciudad_id" }))
    private List<CiudadFavorita> ciudadFavoritas;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private boolean activo;

    public Usuario() {
    }

    public Usuario(String correoUsuario, String contrasena) {
        this.correoUsuario = correoUsuario;
        this.contrasena = contrasena;
    }

    @PrePersist
    public void prePersist() {
        this.activo = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCorreoUsuario() {
        return correoUsuario;
    }

    public void setCorreoUsuario(String correoUsuario) {
        this.correoUsuario = correoUsuario;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public List<Seleccion> getSeleccionesU() {
        return seleccionesU;
    }

    public void setSeleccionesU(List<Seleccion> seleccionesU) {
        this.seleccionesU = seleccionesU;
    }

    public List<EstadioFavorito> getPreferenciasu() {
        return preferenciasu;
    }

    public void setPreferenciasu(List<EstadioFavorito> preferenciasu) {
        this.preferenciasu = preferenciasu;
    }

    public List<CiudadFavorita> getCiudadFavoritas() {
        return ciudadFavoritas;
    }

    public void setCiudadFavoritas(List<CiudadFavorita> ciudadFavoritas) {
        this.ciudadFavoritas = ciudadFavoritas;
    }
}