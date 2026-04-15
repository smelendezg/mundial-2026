package co.edu.unbosque.mundial_2026.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InfoPartidoDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("date")
    private String fecha;

    @JsonProperty("status")
    private EstadoDTO estado;

    @JsonProperty("venue")
    private EstadioDTO estadio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public EstadoDTO getEstado() {
        return estado;
    }

    public void setEstado(EstadoDTO estado) {
        this.estado = estado;
    }

    public EstadioDTO getEstadio() {
        return estadio;
    }

    public void setEstadio(EstadioDTO estadio) {
        this.estadio = estadio;
    }
}