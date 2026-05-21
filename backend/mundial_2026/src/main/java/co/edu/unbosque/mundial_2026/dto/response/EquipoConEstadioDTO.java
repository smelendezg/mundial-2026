package co.edu.unbosque.mundial_2026.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EquipoConEstadioDTO {

    @JsonProperty("home")
    private EquipoDTO local;

    @JsonProperty("away")
    private EquipoDTO visitante;

    public EquipoDTO getLocal() {
        return local;
    }

    public void setLocal(EquipoDTO local) {
        this.local = local;
    }

    public EquipoDTO getVisitante() {
        return visitante;
    }

    public void setVisitante(EquipoDTO visitante) {
        this.visitante = visitante;
    }
}