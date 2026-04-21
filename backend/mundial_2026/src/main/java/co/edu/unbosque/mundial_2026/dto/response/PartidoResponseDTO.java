package co.edu.unbosque.mundial_2026.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class PartidoResponseDTO {

    @JsonProperty("response")
    private List<PartidoDTO> partidos;

    public List<PartidoDTO> getPartidos() {
        return partidos;
    }

    public void setPartidos(List<PartidoDTO> partidos) {
        this.partidos = partidos;
    }
}