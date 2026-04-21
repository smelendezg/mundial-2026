package co.edu.unbosque.mundial_2026.exception;

public class CorreoEnUsoException extends RuntimeException {
    public CorreoEnUsoException(String mensaje) {
        super(mensaje);
    }
}