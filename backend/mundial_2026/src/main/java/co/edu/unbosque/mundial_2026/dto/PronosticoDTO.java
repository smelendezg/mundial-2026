package co.edu.unbosque.mundial_2026.dto;

public class PronosticoDTO {

    private Long id;
    private String resultadoPronosticado;
    private Integer golesLocalPronosticados;
    private Integer golesVisitantePronosticados;
    private Integer puntosObtenidos;
    private Long usuarioId;
    private Long apuestaId;
    private Long partidoId;

    public PronosticoDTO() {
    }

    public PronosticoDTO(Long id, String resultadoPronosticado, Integer golesLocalPronosticados,
            Integer golesVisitantePronosticados, Integer puntosObtenidos,
            Long usuarioId, Long apuestaId, Long partidoId) {
        this.id = id;
        this.resultadoPronosticado = resultadoPronosticado;
        this.golesLocalPronosticados = golesLocalPronosticados;
        this.golesVisitantePronosticados = golesVisitantePronosticados;
        this.puntosObtenidos = puntosObtenidos;
        this.usuarioId = usuarioId;
        this.apuestaId = apuestaId;
        this.partidoId = partidoId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Integer getPuntosObtenidos() {
        return puntosObtenidos;
    }

    public void setPuntosObtenidos(Integer p) {
        this.puntosObtenidos = p;
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