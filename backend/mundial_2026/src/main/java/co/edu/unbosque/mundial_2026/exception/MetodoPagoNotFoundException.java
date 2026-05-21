package co.edu.unbosque.mundial_2026.exception;

public class MetodoPagoNotFoundException extends RuntimeException {
    public MetodoPagoNotFoundException(String mensaje) {
        super(mensaje);
    }
}