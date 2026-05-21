package co.edu.unbosque.mundial_2026.dto.request;

public class EntradaRequestDTO {
    private Long partidoId;
    private Integer cantidad;

    public EntradaRequestDTO() {
        //Constructor vacio
    }

    public Long getPartidoId() {
        return partidoId;
    }

    public void setPartidoId(Long partidoId) {
        this.partidoId = partidoId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}