package co.edu.unbosque.mundial_2026.exception;

public class EntradaNotFoundException extends RuntimeException {
    public EntradaNotFoundException(String mensaje) {
        super(mensaje);
    }
}