package co.edu.unbosque.mundial_2026.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "pronosticos")
public class Pronostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resultado_pronosticado", nullable = false)
    private String resultadoPronosticado;

    @Column(name = "goles_local_pronosticados")
    private Integer golesLocalPronosticados;

    @Column(name = "goles_visitante_pronosticados")
    private Integer golesVisitantePronosticados;

    @Column(name = "puntos_obtenidos")
    private Integer puntosObtenidos;

    @ManyToOne
    @JoinColumn(name = "apuesta_id", nullable = false)
    private Apuesta apuesta;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "partido_id", nullable = false)
    private Partido partido;

    public Pronostico() {
        //Constructor vacio
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

    public Apuesta getApuesta() {
        return apuesta;
    }

    public void setApuesta(Apuesta apuesta) {
        this.apuesta = apuesta;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Partido getPartido() {
        return partido;
    }

    public void setPartido(Partido partido) {
        this.partido = partido;
    }
}