package co.edu.unbosque.mundial_2026.exception;

public class PagoStripeException extends RuntimeException {
    public PagoStripeException(String mensaje) {
        super(mensaje);
    }
}