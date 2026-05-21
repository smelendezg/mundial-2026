package co.edu.unbosque.mundial_2026.dto.response;

import java.util.List;

public class ReportesComprasDTO {

    private double ingresoTotal;
    private int totalOrdenes;
    private long totalEntradasVendidas;
    private List<ProductoMasVendidoDTO> productosMasVendidos;
    private List<VentasPorCategoriaDTO> ventasPorCategoria;

    public ReportesComprasDTO() {
    }

    public double getIngresoTotal() {
        return ingresoTotal;
    }

    public void setIngresoTotal(double ingresoTotal) {
        this.ingresoTotal = ingresoTotal;
    }

    public int getTotalOrdenes() {
        return totalOrdenes;
    }

    public void setTotalOrdenes(int totalOrdenes) {
        this.totalOrdenes = totalOrdenes;
    }

    public long getTotalEntradasVendidas() {
        return totalEntradasVendidas;
    }

    public void setTotalEntradasVendidas(long totalEntradasVendidas) {
        this.totalEntradasVendidas = totalEntradasVendidas;
    }

    public List<ProductoMasVendidoDTO> getProductosMasVendidos() {
        return productosMasVendidos;
    }

    public void setProductosMasVendidos(List<ProductoMasVendidoDTO> productosMasVendidos) {
        this.productosMasVendidos = productosMasVendidos;
    }

    public List<VentasPorCategoriaDTO> getVentasPorCategoria() {
        return ventasPorCategoria;
    }

    public void setVentasPorCategoria(List<VentasPorCategoriaDTO> ventasPorCategoria) {
        this.ventasPorCategoria = ventasPorCategoria;
    }
}
