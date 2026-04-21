package co.edu.unbosque.mundial_2026.entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "estadiosFavoritos")
public class EstadioFavorito {

    @Id
    private Long id;

    private String nombre;

    @ManyToOne
    @JoinColumn(name = "ciudad_id")
    private CiudadFavorita ciudad;

    @ManyToMany(mappedBy = "preferenciasu")
    private List<Usuario> usuarios;

    public EstadioFavorito() {
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

    public CiudadFavorita getCiudad() {
        return ciudad;
    }

    public void setCiudad(CiudadFavorita ciudad) {
        this.ciudad = ciudad;
    }

    public List<Usuario> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<Usuario> usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        EstadioFavorito estadio = (EstadioFavorito) o;
        return id != null && id.equals(estadio.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}