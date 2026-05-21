package co.edu.unbosque.mundial_2026.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class JugadorResponseDTO {

    @JsonProperty("response")
    private List<EquipoJugadorDTO> respuesta;

    public List<EquipoJugadorDTO> getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(List<EquipoJugadorDTO> respuesta) {
        this.respuesta = respuesta;
    }
}