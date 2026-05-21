package co.edu.unbosque.mundial_2026.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PartidoDTO {

    @JsonProperty("fixture")
    private InfoPartidoDTO informacion;

    @JsonProperty("league")
    private LigaDTO liga;

    @JsonProperty("teams")
    private EquipoConEstadioDTO equipos;

    @JsonProperty("goals")
    private MarcadorDTO goles;

    public InfoPartidoDTO getInformacion() {
        return informacion;
    }

    public void setInformacion(InfoPartidoDTO informacion) {
        this.informacion = informacion;
    }

    public LigaDTO getLiga() {
        return liga;
    }

    public void setLiga(LigaDTO liga) {
        this.liga = liga;
    }

    public EquipoConEstadioDTO getEquipos() {
        return equipos;
    }

    public void setEquipos(EquipoConEstadioDTO equipos) {
        this.equipos = equipos;
    }

    public MarcadorDTO getGoles() {
        return goles;
    }

    public void setGoles(MarcadorDTO goles) {
        this.goles = goles;
    }
}