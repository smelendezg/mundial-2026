package co.edu.unbosque.mundial_2026.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class EquipoResponseDTO {

    @JsonProperty("response")
    private List<EquipoConEstadioDTO> equipos;

    public List<EquipoConEstadioDTO> getEquipos() {
        return equipos;
    }

    public void setEquipos(List<EquipoConEstadioDTO> equipos) {
        this.equipos = equipos;
    }
}