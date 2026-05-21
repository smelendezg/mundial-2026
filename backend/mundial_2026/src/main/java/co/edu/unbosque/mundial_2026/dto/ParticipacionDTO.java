package co.edu.unbosque.mundial_2026.dto;

public class ParticipacionDTO {

    private Long id;
    private Long usuarioId;
    private Long apuestaId;
    private Integer puntos;
    private Integer posicionRanking;

    public ParticipacionDTO() {
    }

    public ParticipacionDTO(Long id, Long usuarioId, Long apuestaId, Integer puntos, Integer posicionRanking) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.apuestaId = apuestaId;
        this.puntos = puntos;
        this.posicionRanking = posicionRanking;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getApuestaId() {
        return apuestaId;
    }

    public void setApuestaId(Long apuestaId) {
        this.apuestaId = apuestaId;
    }

    public Integer getPuntos() {
        return puntos;
    }

    public void setPuntos(Integer puntos) {
        this.puntos = puntos;
    }

    public Integer getPosicionRanking() {
        return posicionRanking;
    }

    public void setPosicionRanking(Integer posicionRanking) {
        this.posicionRanking = posicionRanking;
    }
}