package co.edu.unbosque.mundial_2026.dto.response;

public class PartidoMasApostadoDTO {

    private Long partidoId;
    private String local;
    private String visitante;
    private String ronda;
    private int totalPronosticos;

    public PartidoMasApostadoDTO(Long partidoId, String local, String visitante, String ronda, int totalPronosticos) {
        this.partidoId = partidoId;
        this.local = local;
        this.visitante = visitante;
        this.ronda = ronda;
        this.totalPronosticos = totalPronosticos;
    }

    public Long getPartidoId() { return partidoId; }
    public void setPartidoId(Long partidoId) { this.partidoId = partidoId; }

    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }

    public String getVisitante() { return visitante; }
    public void setVisitante(String visitante) { this.visitante = visitante; }

    public String getRonda() { return ronda; }
    public void setRonda(String ronda) { this.ronda = ronda; }

    public int getTotalPronosticos() { return totalPronosticos; }
    public void setTotalPronosticos(int totalPronosticos) { this.totalPronosticos = totalPronosticos; }
}
