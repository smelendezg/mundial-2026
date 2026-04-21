package co.edu.unbosque.mundial_2026.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EquipoMundialDTO {

    @JsonProperty("team")
    private EquipoInfoDTO seleccion;  

    @JsonProperty("venue")
    private EstadioDTO estadio;  

    public EquipoInfoDTO getSeleccion() { return seleccion; }
    public void setSeleccion(EquipoInfoDTO seleccion) { this.seleccion = seleccion; }
    public EstadioDTO getEstadio() { return estadio; }
    public void setEstadio(EstadioDTO estadio) { this.estadio = estadio; }
}