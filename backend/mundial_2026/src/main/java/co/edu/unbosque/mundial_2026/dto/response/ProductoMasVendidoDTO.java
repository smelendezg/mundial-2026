package co.edu.unbosque.mundial_2026.dto.response;

public class ProductoMasVendidoDTO {

    private Long productoId;
    private String nombre;
    private String categoria;
    private int cantidadVendida;
    private double ingresoTotal;

    public ProductoMasVendidoDTO() {
    }

    public ProductoMasVendidoDTO(Long productoId, String nombre, String categoria, int cantidadVendida, double ingresoTotal) {
        this.productoId = productoId;
        this.nombre = nombre;
        this.categoria = categoria;
        this.cantidadVendida = cantidadVendida;
        this.ingresoTotal = ingresoTotal;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
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
