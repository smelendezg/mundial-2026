package co.edu.unbosque.mundial_2026.dto.response;

public class ItemOrdenResponseDTO {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoImagenUrl;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getProductoNombre() {
        return productoNombre;
    }

    public void setProductoNombre(String productoNombre) {
        this.productoNombre = productoNombre;
    }

    public String getProductoImagenUrl() {
        return productoImagenUrl;
    }

    public void setProductoImagenUrl(String productoImagenUrl) {
        this.productoImagenUrl = productoImagenUrl;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
}