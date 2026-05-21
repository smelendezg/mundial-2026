package co.edu.unbosque.mundial_2026.exception;

public class ContrasenaIncorrectaException extends RuntimeException {
    public ContrasenaIncorrectaException(String mensaje) {
        super(mensaje);
    }
}