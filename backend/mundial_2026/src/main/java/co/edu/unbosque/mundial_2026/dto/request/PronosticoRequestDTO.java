package co.edu.unbosque.mundial_2026.dto.request;

public class PronosticoRequestDTO {
    private String resultadoPronosticado;
    private Integer golesLocalPronosticados;
    private Integer golesVisitantePronosticados;
    private Long usuarioId;
    private Long apuestaId;
    private Long partidoId;

    public String getResultadoPronosticado() {
        return resultadoPronosticado;
    }

    public void setResultadoPronosticado(String r) {
        this.resultadoPronosticado = r;
    }

    public Integer getGolesLocalPronosticados() {
        return golesLocalPronosticados;
    }

    public void setGolesLocalPronosticados(Integer g) {
        this.golesLocalPronosticados = g;
    }

    public Integer getGolesVisitantePronosticados() {
        return golesVisitantePronosticados;
    }

    public void setGolesVisitantePronosticados(Integer g) {
        this.golesVisitantePronosticados = g;
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

    public Long getPartidoId() {
        return partidoId;
    }

    public void setPartidoId(Long partidoId) {
        this.partidoId = partidoId;
    }
}