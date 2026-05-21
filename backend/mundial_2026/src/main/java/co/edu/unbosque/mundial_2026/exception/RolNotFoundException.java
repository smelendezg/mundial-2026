package co.edu.unbosque.mundial_2026.exception;

public class RolNotFoundException extends RuntimeException {
    public RolNotFoundException(String mensaje) {
        super(mensaje);
    }
}