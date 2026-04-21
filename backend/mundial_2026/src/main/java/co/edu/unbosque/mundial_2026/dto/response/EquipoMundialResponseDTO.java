package co.edu.unbosque.mundial_2026.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class EquipoMundialResponseDTO {

    @JsonProperty("response")
    private List<EquipoMundialDTO> equipos;

    public List<EquipoMundialDTO> getEquipos() { return equipos; }
    public void setEquipos(List<EquipoMundialDTO> equipos) { this.equipos = equipos; }
}