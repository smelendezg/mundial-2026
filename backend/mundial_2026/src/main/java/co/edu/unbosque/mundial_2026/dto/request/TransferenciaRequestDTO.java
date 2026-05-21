package co.edu.unbosque.mundial_2026.dto.request;

public class TransferenciaRequestDTO {
    private String correoDestino;

    public TransferenciaRequestDTO() {
        //Constructor vacio
    }

    public String getCorreoDestino() {
        return correoDestino;
    }

    public void setCorreoDestino(String correoDestino) {
        this.correoDestino = correoDestino;
    }
}