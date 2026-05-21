package co.edu.unbosque.mundial_2026.exception;

public class LimiteSuperadoException extends RuntimeException {
    public LimiteSuperadoException(String mensaje) {
        super(mensaje);
    }
}