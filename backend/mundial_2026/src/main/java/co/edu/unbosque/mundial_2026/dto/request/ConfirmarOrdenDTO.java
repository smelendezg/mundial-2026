package co.edu.unbosque.mundial_2026.dto.request;

import jakarta.validation.constraints.NotNull;

public class ConfirmarOrdenDTO {

    @NotNull(message = "El metodo de pago es obligatorio")
    private Long metodoPagoId;

    public Long getMetodoPagoId() {
        return metodoPagoId;
    }

    public void setMetodoPagoId(Long metodoPagoId) {
        this.metodoPagoId = metodoPagoId;
    }
}