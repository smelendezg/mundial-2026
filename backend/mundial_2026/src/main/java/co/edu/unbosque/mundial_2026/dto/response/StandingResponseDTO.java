package co.edu.unbosque.mundial_2026.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class StandingResponseDTO {

    @JsonProperty("response")
    private List<LigaStandingDTO> respuesta;

    public List<LigaStandingDTO> getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(List<LigaStandingDTO> respuesta) {
        this.respuesta = respuesta;
    }
}