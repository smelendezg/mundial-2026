package co.edu.unbosque.mundial_2026.exception;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler{

    @ExceptionHandler(UsuarioNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsuarioNotFound(UsuarioNotFoundException e) {
        return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(CorreoEnUsoException.class)
    public ResponseEntity<Map<String, Object>> handleCorreoEnUso(CorreoEnUsoException e) {
        return buildResponse(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(ContrasenaIncorrectaException.class)
    public ResponseEntity<Map<String, Object>> handleContrasenaIncorrecta(ContrasenaIncorrectaException e) {
        return buildResponse(HttpStatus.UNAUTHORIZED, e.getMessage());
    }

    @ExceptionHandler(RolNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleRolNotFound(RolNotFoundException e) {
        return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException e) {
        return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        final Map<String, Object> errors = new HashMap<>();
        errors.put("date", ZonedDateTime.now());
        errors.put("status", HttpStatus.BAD_REQUEST.value());
        errors.put("error", "Error de validación");
        final Map<String, String> campos = new HashMap<>();
        for (FieldError field : e.getBindingResult().getFieldErrors()) {
            campos.put(field.getField(), field.getDefaultMessage());
        }
        errors.put("campos", campos);
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(NoResourceFoundException e) {
        return buildResponse(HttpStatus.NOT_FOUND, "Endpoint no encontrado");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String mensaje) {
        final Map<String, Object> body = new HashMap<>();
        body.put("date", ZonedDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("mensaje", mensaje);
        return ResponseEntity.status(status).body(body);
    }
    @ExceptionHandler(PartidoNotFoundException.class)
public ResponseEntity<Map<String, Object>> handlePartidoNotFound(PartidoNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}
@ExceptionHandler(EntradaNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleEntradaNotFound(EntradaNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}

@ExceptionHandler(CupoNoDisponibleException.class)
public ResponseEntity<Map<String, Object>> handleCupoNoDisponible(CupoNoDisponibleException e) {
    return buildResponse(HttpStatus.CONFLICT, e.getMessage());
}

@ExceptionHandler(LimiteSuperadoException.class)
public ResponseEntity<Map<String, Object>> handleLimiteSuperado(LimiteSuperadoException e) {
    return buildResponse(HttpStatus.TOO_MANY_REQUESTS, e.getMessage());
}

@ExceptionHandler(EstadoInvalidoException.class)
public ResponseEntity<Map<String, Object>> handleEstadoInvalido(EstadoInvalidoException e) {
    return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
}

@ExceptionHandler(PagoStripeException.class)
public ResponseEntity<Map<String, Object>> handlePagoStripe(PagoStripeException e) {
    return buildResponse(HttpStatus.PAYMENT_REQUIRED, e.getMessage());
}

@ExceptionHandler(MetodoPagoNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleMetodoPagoNotFound(MetodoPagoNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}
@ExceptionHandler(ProductoNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleProductoNotFound(ProductoNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}

@ExceptionHandler(OrdenNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleOrdenNotFound(OrdenNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}

@ExceptionHandler(StockInsuficienteException.class)
public ResponseEntity<Map<String, Object>> handleStockInsuficiente(StockInsuficienteException e) {
    return buildResponse(HttpStatus.CONFLICT, e.getMessage());
}

@ExceptionHandler(CategoriaNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleCategoriaNotFound(CategoriaNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}
@ExceptionHandler(ApuestaNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleApuestaNotFound(ApuestaNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}

@ExceptionHandler(PronosticoNotFoundException.class)
public ResponseEntity<Map<String, Object>> handlePronosticoNotFound(PronosticoNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}
@ExceptionHandler(CodigoInvalidoException.class)
public ResponseEntity<Map<String, Object>> handleCodigoInvalido(CodigoInvalidoException e) {
    return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
}

@ExceptionHandler(ParticipacionNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleParticipacionNotFound(ParticipacionNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}

@ExceptionHandler(UsuarioYaEnApuestaException.class)
public ResponseEntity<Map<String, Object>> handleUsuarioYaEnApuesta(UsuarioYaEnApuestaException e) {
    return buildResponse(HttpStatus.CONFLICT, e.getMessage());
}

@ExceptionHandler(ApuestaCerradaException.class)
public ResponseEntity<Map<String, Object>> handleApuestaCerrada(ApuestaCerradaException e) {
    return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
}
@ExceptionHandler(CarritoVacioException.class)
public ResponseEntity<Map<String, Object>> handleCarritoVacio(CarritoVacioException e) {
    return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
}

@ExceptionHandler(MetodoPagoInvalidoException.class)
public ResponseEntity<Map<String, Object>> handleMetodoPagoInvalido(MetodoPagoInvalidoException e) {
    return buildResponse(HttpStatus.BAD_REQUEST, e.getMessage());
}

@ExceptionHandler(ItemNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleItemNotFound(ItemNotFoundException e) {
    return buildResponse(HttpStatus.NOT_FOUND, e.getMessage());
}
@ExceptionHandler(CategoriaYaExisteException.class)
public ResponseEntity<Map<String, Object>> handleCategoriaYaExiste(CategoriaYaExisteException e) {
    return buildResponse(HttpStatus.CONFLICT, e.getMessage());
}

}