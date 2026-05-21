package co.edu.unbosque.mundial_2026.dto.response;

public class PollaRankingDTO {

    private Long apuestaId;
    private String nombre;
    private String estado;
    private int totalParticipantes;

    public PollaRankingDTO(Long apuestaId, String nombre, String estado, int totalParticipantes) {
        this.apuestaId = apuestaId;
        this.nombre = nombre;
        this.estado = estado;
        this.totalParticipantes = totalParticipantes;
    }

    public Long getApuestaId() { return apuestaId; }
    public void setApuestaId(Long apuestaId) { this.apuestaId = apuestaId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public int getTotalParticipantes() { return totalParticipantes; }
    public void setTotalParticipantes(int totalParticipantes) { this.totalParticipantes = totalParticipantes; }
}
