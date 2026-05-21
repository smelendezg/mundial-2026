package co.edu.unbosque.mundial_2026.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MarcadorDTO {

    @JsonProperty("home")
    private Integer local;

    @JsonProperty("away")
    private Integer visitante;

    public Integer getLocal() {
        return local;
    }

    public void setLocal(Integer local) {
        this.local = local;
    }

    public Integer getVisitante() {
        return visitante;
    }

    public void setVisitante(Integer visitante) {
        this.visitante = visitante;
    }
}