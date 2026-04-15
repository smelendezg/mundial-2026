package co.edu.unbosque.mundial_2026.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class EstadisticaGrupoDTO {

    @JsonProperty("standings")
    private List<List<PosicionDTO>> tablas;

    public List<List<PosicionDTO>> getTablas() {
        return tablas;
    }

    public void setTablas(List<List<PosicionDTO>> tablas) {
        this.tablas = tablas;
    }
}