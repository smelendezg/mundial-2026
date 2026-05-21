package co.edu.unbosque.mundial_2026.dto.request;

import java.util.List;

public class NotificacionMasivaRequestDTO {

    private String tipo;
    private String titulo;
    private String mensaje;
    private String canal;
    private List<Long> usuarioIds;

    public NotificacionMasivaRequestDTO() {
        //Constructor vacio
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getCanal() {
        return canal;
    }

    public void setCanal(String canal) {
        this.canal = canal;
    }

    public List<Long> getUsuarioIds() {
        return usuarioIds;
    }

    public void setUsuarioIds(List<Long> usuarioIds) {
        this.usuarioIds = usuarioIds;
    }
}