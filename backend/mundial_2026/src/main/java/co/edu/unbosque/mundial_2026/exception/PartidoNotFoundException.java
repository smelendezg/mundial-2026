package co.edu.unbosque.mundial_2026.exception;

public class PartidoNotFoundException extends RuntimeException {
    public PartidoNotFoundException(String mensaje) {
        super(mensaje);
    }
}