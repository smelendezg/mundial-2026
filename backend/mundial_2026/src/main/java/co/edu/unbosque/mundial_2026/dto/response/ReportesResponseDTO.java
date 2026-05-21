package co.edu.unbosque.mundial_2026.dto.response;

public class ReportesResponseDTO {
    private int totalUsuarios;
    private int totalPartidos;
    private int totalTransacciones;
    private int usuariosActivosHoy;
    // meter los productos mas vendidos
    // mas que todo del modulo que nos tocó
    // Los productos mas vendidos en el sistema, incluyendo su nombre y cantidad
    // vendida.

    public ReportesResponseDTO(int totalUsuarios, int totalPartidos, int totalTransacciones, int usuariosActivosHoy) {
        this.totalUsuarios = totalUsuarios;
        this.totalPartidos = totalPartidos;
        this.totalTransacciones = totalTransacciones;
        this.usuariosActivosHoy = usuariosActivosHoy;
    }

    public ReportesResponseDTO() {
    }

    public int getTotalUsuarios() {
        return totalUsuarios;
    }

    public void setTotalUsuarios(int totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }

    public int getTotalPartidos() {
        return totalPartidos;
    }

    public void setTotalPartidos(int totalPartidos) {
        this.totalPartidos = totalPartidos;
    }

    public int getTotalTransacciones() {
        return totalTransacciones;
    }

    public void setTotalTransacciones(int totalTransacciones) {
        this.totalTransacciones = totalTransacciones;
    }

    public int getUsuariosActivosHoy() {
        return usuariosActivosHoy;
    }

    public void setUsuariosActivosHoy(int usuariosActivosHoy) {
        this.usuariosActivosHoy = usuariosActivosHoy;
    }
}
