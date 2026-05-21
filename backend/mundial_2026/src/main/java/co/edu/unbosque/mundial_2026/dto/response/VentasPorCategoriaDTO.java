package co.edu.unbosque.mundial_2026.dto.response;

public class VentasPorCategoriaDTO {

    private String categoria;
    private int cantidadVendida;
    private double ingresoTotal;

    public VentasPorCategoriaDTO() {
    }

    public VentasPorCategoriaDTO(String categoria, int cantidadVendida, double ingresoTotal) {
        this.categoria = categoria;
        this.cantidadVendida = cantidadVendida;
        this.ingresoTotal = ingresoTotal;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public int getCantidadVendida() {
        return cantidadVendida;
    }

    public void setCantidadVendida(int cantidadVendida) {
        this.cantidadVendida = cantidadVendida;
    }

    public double getIngresoTotal() {
        return ingresoTotal;
    }

    public void setIngresoTotal(double ingresoTotal) {
        this.ingresoTotal = ingresoTotal;
    }
}
