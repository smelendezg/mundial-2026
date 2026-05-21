package co.edu.unbosque.mundial_2026.dto.response;

public class IngresoMetodoPagoDTO {

    private String tipo;
    private int totalOrdenes;
    private double ingresoTotal;

    public IngresoMetodoPagoDTO(String tipo, int totalOrdenes, double ingresoTotal) {
        this.tipo = tipo;
        this.totalOrdenes = totalOrdenes;
        this.ingresoTotal = ingresoTotal;
    }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public int getTotalOrdenes() { return totalOrdenes; }
    public void setTotalOrdenes(int totalOrdenes) { this.totalOrdenes = totalOrdenes; }

    public double getIngresoTotal() { return ingresoTotal; }
    public void setIngresoTotal(double ingresoTotal) { this.ingresoTotal = ingresoTotal; }
}
