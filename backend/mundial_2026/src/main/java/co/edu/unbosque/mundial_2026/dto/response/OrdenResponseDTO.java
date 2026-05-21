package co.edu.unbosque.mundial_2026.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class OrdenResponseDTO {

    private Long id;
    private String estado;
    private Double total;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaPago;
    private String paymentRef;
    private String metodoPagoLabel;
    private List<ItemOrdenResponseDTO> items;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getPaymentRef() {
        return paymentRef;
    }

    public void setPaymentRef(String paymentRef) {
        this.paymentRef = paymentRef;
    }

    public String getMetodoPagoLabel() {
        return metodoPagoLabel;
    }

    public void setMetodoPagoLabel(String metodoPagoLabel) {
        this.metodoPagoLabel = metodoPagoLabel;
    }

    public List<ItemOrdenResponseDTO> getItems() {
        return items;
    }

    public void setItems(List<ItemOrdenResponseDTO> items) {
        this.items = items;
    }
}