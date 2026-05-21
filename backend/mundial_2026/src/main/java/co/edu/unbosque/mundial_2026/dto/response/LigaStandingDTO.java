package co.edu.unbosque.mundial_2026.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LigaStandingDTO {

    @JsonProperty("league")
    private EstadisticaGrupoDTO tablas;

    public EstadisticaGrupoDTO getTablas() {
        return tablas;
    }

    public void setTablas(EstadisticaGrupoDTO tablas) {
        this.tablas = tablas;
    }
}