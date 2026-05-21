package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;

import co.edu.unbosque.mundial_2026.dto.PartidoCapacidadDTO;
import co.edu.unbosque.mundial_2026.dto.request.EntradaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.EntradaResponseDTO;
import co.edu.unbosque.mundial_2026.entity.Entrada;
import co.edu.unbosque.mundial_2026.entity.Partido;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.CupoNoDisponibleException;
import co.edu.unbosque.mundial_2026.exception.EntradaNotFoundException;
import co.edu.unbosque.mundial_2026.exception.EstadoInvalidoException;
import co.edu.unbosque.mundial_2026.exception.LimiteSuperadoException;
import co.edu.unbosque.mundial_2026.exception.PagoStripeException;
import co.edu.unbosque.mundial_2026.repository.EntradaRepository;



@Service
public class EntradaServiceImpl implements EntradaService {

    private final EntradaRepository entradaRepository;
    private final UsuarioService usuarioService;
private final PartidoService partidoService;
    private final EventoAuditoriaService auditoriaService;
    
    private static final String ESTADO_RESERVADA = "RESERVADA";
private static final String ESTADO_PAGADA = "PAGADA";
private static final String ESTADO_TRANSFERIDA = "TRANSFERIDA";
private static final String ENTRADA_NO_ENCONTRADA = "Entrada no encontrada";
private static final String TIPO_ENTRADA = "ENTRADA";
private static final String PREFIJO_USUARIO = "Usuario ";



    private static final Map<String, Long> PRECIO_POR_RONDA = new HashMap<>();
static {
    PRECIO_POR_RONDA.put("Group Stage - 1", 50000L);
    PRECIO_POR_RONDA.put("Group Stage - 2", 50000L);
    PRECIO_POR_RONDA.put("Group Stage - 3", 50000L);
    PRECIO_POR_RONDA.put("Round of 32", 80000L);
    PRECIO_POR_RONDA.put("Round of 16", 100000L);
    PRECIO_POR_RONDA.put("Quarter-finals", 150000L);
    PRECIO_POR_RONDA.put("Semi-finals", 200000L);
    PRECIO_POR_RONDA.put("3rd Place Final", 180000L);
    PRECIO_POR_RONDA.put("Final", 300000L);
}
private static final Set<String> SELECCIONES_TOP = new HashSet<>();
static {
    SELECCIONES_TOP.add("France");
    SELECCIONES_TOP.add("Spain");
    SELECCIONES_TOP.add("Argentina");
    SELECCIONES_TOP.add("England");
    SELECCIONES_TOP.add("Portugal");
    SELECCIONES_TOP.add("Brazil");
    SELECCIONES_TOP.add("Netherlands");
    SELECCIONES_TOP.add("Morocco");
    SELECCIONES_TOP.add("Belgium");
    SELECCIONES_TOP.add("Germany");
    SELECCIONES_TOP.add("Colombia");
}

    public EntradaServiceImpl(EntradaRepository entradaRepository,
    UsuarioService usuarioService,
    PartidoService partidoService,
    EventoAuditoriaService auditoriaService,
    @Value("${stripe.api.key}") String stripeApiKey) {
    this.entradaRepository = entradaRepository;
    this.usuarioService = usuarioService;
    this.partidoService = partidoService;
    this.auditoriaService = auditoriaService;
    Stripe.apiKey = stripeApiKey; }
@Override
public EntradaResponseDTO reservarEntrada(String correo, EntradaRequestDTO dto) {
    Usuario u = usuarioService.obtenerEntidadPorCorreo(correo); 
    Long usuarioId = u.getId();

    Partido partido = partidoService.obtenerPartidoEntidadPorId(dto.getPartidoId());

    if (partido.getCapacidadDisponible() < dto.getCantidad()) {
        throw new CupoNoDisponibleException("No hay cupo disponible para este partido");
    }

    if (dto.getCantidad() > 4) {
        throw new LimiteSuperadoException("Máximo 4 entradas por transacción");
    }

    LocalDateTime inicioDia = LocalDateTime.now().toLocalDate().atStartOfDay();
    LocalDateTime finDia = inicioDia.plusDays(1);

    List<Entrada> entradasHoy = entradaRepository.findByUsuarioIdAndFechaCompraBetween(usuarioId, inicioDia, finDia);

    int compradasHoy = 0;
    for (int i = 0; i < entradasHoy.size(); i++) {
        Entrada entrada = entradasHoy.get(i);
        if (entrada.getEstado().equals(ESTADO_RESERVADA) || entrada.getEstado().equals(ESTADO_PAGADA)) {
            compradasHoy += entrada.getCantidad();
        }
    }

    if (compradasHoy + dto.getCantidad() > 12) {
        throw new LimiteSuperadoException("Límite diario de 12 entradas alcanzado");
    }

    Entrada entrada = new Entrada();
    entrada.setUsuario(u);
    entrada.setCantidad(dto.getCantidad());
    entrada.setEstado(ESTADO_RESERVADA);
    entrada.setPartido(partido);
    entrada.setPrecio(calcularPrecio(partido) * dto.getCantidad());
    entrada.setFechaCompra(LocalDateTime.now());
    entrada.setTtlReserva(LocalDateTime.now().plusMinutes(15));

    entradaRepository.save(entrada);

    partidoService.actualizarCapacidad(partido.getId(), -dto.getCantidad());

    auditoriaService.registrar(
        "ENTRADA_RESERVADA",
        PREFIJO_USUARIO + usuarioId + " reservó " + dto.getCantidad() + " entrada(s) para el partido " + partido.getId(),
        usuarioId,
        String.valueOf(entrada.getId()),
        TIPO_ENTRADA
    );

    return toDTO(entrada);
}

    @Override
    public EntradaResponseDTO confirmarPago(Long entradaId, String paymentRef) {
        Entrada entrada = entradaRepository.findById(entradaId).orElseThrow(() -> new EntradaNotFoundException(ENTRADA_NO_ENCONTRADA));

        if (!entrada.getEstado().equals(ESTADO_RESERVADA)) {
            throw new EstadoInvalidoException("La entrada no está en estado RESERVADA");
        }

        if (entrada.getTtlReserva().isBefore(LocalDateTime.now())) {
           throw new EstadoInvalidoException("La reserva ha expirado");
        }

        try {
    
PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
    .setAmount((long)(entrada.getPrecio() * 100))
    .setCurrency("usd")
    .setConfirm(true)
    .setPaymentMethod(paymentRef)
    .setAutomaticPaymentMethods(
        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
            .setEnabled(true)
            .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
            .build()
    )
    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            entrada.setEstado(ESTADO_PAGADA);
            entrada.setPaymentRef(intent.getId());
            entrada.setFechaPago(LocalDateTime.now());
            entrada.setTtlReserva(null);
            entradaRepository.save(entrada);

            auditoriaService.registrar(
                "ENTRADA_PAGADA",
                "Pago confirmado para entrada " + entradaId + " con ref " + intent.getId(),
                entrada.getUsuario().getId(),
                String.valueOf(entradaId),
                TIPO_ENTRADA
            );

        } catch (StripeException e) {
            auditoriaService.registrar(
                "ENTRADA_PAGO_FALLIDO",
                "Fallo en pago de entrada " + entradaId + ": " + e.getMessage(),
                entrada.getUsuario().getId(),
                String.valueOf(entradaId),
                TIPO_ENTRADA
            );
          throw new PagoStripeException("Error al procesar el pago: " + e.getMessage());
        }

        return toDTO(entrada);
    }

 @Override
public EntradaResponseDTO cancelarReserva(String correo, Long entradaId) {
    Usuario u = usuarioService.obtenerEntidadPorCorreo(correo); // ← cambio
    Long usuarioId = u.getId();

    Entrada entrada = entradaRepository.findById(entradaId)
            .orElseThrow(() -> new EntradaNotFoundException(ENTRADA_NO_ENCONTRADA));

    if (!entrada.getUsuario().getId().equals(usuarioId)) {
        throw new EstadoInvalidoException("Esta entrada no pertenece al usuario");
    }

    if (!entrada.getEstado().equals(ESTADO_RESERVADA)) {
        throw new EstadoInvalidoException("Solo se pueden cancelar entradas en estado RESERVADA");
    }

    entrada.setEstado("CANCELADA");
    entradaRepository.save(entrada);

    partidoService.actualizarCapacidad(entrada.getPartido().getId(), entrada.getCantidad());

    auditoriaService.registrar(
        "ENTRADA_CANCELADA",
        PREFIJO_USUARIO + usuarioId + " canceló la entrada " + entradaId,
        usuarioId,
        String.valueOf(entradaId),
        TIPO_ENTRADA
    );

    return toDTO(entrada);
}

   @Override
public EntradaResponseDTO transferirEntrada(Long entradaId, TransferenciaRequestDTO dto, String correo) {
    Usuario u = usuarioService.obtenerEntidadPorCorreo(correo); 
    Long usuarioId = u.getId();

    Entrada entrada = entradaRepository.findById(entradaId)
            .orElseThrow(() -> new EntradaNotFoundException(ENTRADA_NO_ENCONTRADA));

    if (!entrada.getUsuario().getId().equals(usuarioId)) {
        throw new EstadoInvalidoException("Esta entrada no pertenece al usuario");
    }

    if (!entrada.getEstado().equals(ESTADO_PAGADA)) {
        throw new EstadoInvalidoException("Solo se pueden transferir entradas pagadas");
    }

    LocalDateTime inicioDia = LocalDateTime.now().toLocalDate().atStartOfDay();
    LocalDateTime finDia = inicioDia.plusDays(1);

    List<Entrada> transferenciasHoy = entradaRepository.findByUsuarioIdAndFechaCompraBetween(usuarioId, inicioDia, finDia);
    int totalTransferidas = 0;
    for (int i = 0; i < transferenciasHoy.size(); i++) {
        Entrada entradaActual = transferenciasHoy.get(i);
        if (entradaActual.getEstado().equals(ESTADO_TRANSFERIDA)) {
            totalTransferidas += entradaActual.getCantidad();
        }
    }

    if (totalTransferidas + entrada.getCantidad() > 12) {
        throw new LimiteSuperadoException("Límite diario de transferencias alcanzado");
    }

    Usuario usuarioRecibe = usuarioService.obtenerEntidadPorCorreo(dto.getCorreoDestino());
    entrada.setEstado(ESTADO_TRANSFERIDA);
    entradaRepository.save(entrada);

    Entrada nuevaEntrada = new Entrada();
    nuevaEntrada.setCantidad(entrada.getCantidad());
    nuevaEntrada.setUsuario(usuarioRecibe);
    nuevaEntrada.setPartido(entrada.getPartido());
    nuevaEntrada.setPrecio(entrada.getPrecio());
    nuevaEntrada.setEstado(ESTADO_PAGADA);
    nuevaEntrada.setFechaCompra(LocalDateTime.now());
    entradaRepository.save(nuevaEntrada);

    auditoriaService.registrar(
        "ENTRADA_TRANSFERIDA",
        PREFIJO_USUARIO + usuarioId + " transfirió entrada " + entradaId + " a " + dto.getCorreoDestino(),
        usuarioId,
        String.valueOf(entradaId),
        TIPO_ENTRADA
    );

    return toDTO(nuevaEntrada);
}

   @Override
public EntradaResponseDTO reembolsarEntrada(String correo, Long entradaId) {
    Usuario u = usuarioService.obtenerEntidadPorCorreo(correo); 
    Long usuarioId = u.getId();

    Entrada entrada = entradaRepository.findById(entradaId)
            .orElseThrow(() -> new EntradaNotFoundException(ENTRADA_NO_ENCONTRADA));

    if (!entrada.getUsuario().getId().equals(usuarioId)) {
        throw new EstadoInvalidoException("Esta entrada no pertenece al usuario");
    }

    if (!entrada.getEstado().equals(ESTADO_PAGADA)) {
        throw new EstadoInvalidoException("Solo se pueden reembolsar entradas pagadas");
    }

    try {
       

        RefundCreateParams params = RefundCreateParams.builder()
            .setPaymentIntent(entrada.getPaymentRef())
            .build();

        Refund.create(params);

        entrada.setEstado("REEMBOLSADA");
        entrada.setFechaReembolso(LocalDateTime.now());
        entradaRepository.save(entrada);

        partidoService.actualizarCapacidad(entrada.getPartido().getId(), entrada.getCantidad());

        auditoriaService.registrar(
            "ENTRADA_REEMBOLSADA",
            PREFIJO_USUARIO + usuarioId + " reembolsó la entrada " + entradaId,
            usuarioId,
            String.valueOf(entradaId),
            TIPO_ENTRADA
        );

    } catch (StripeException e) {
        auditoriaService.registrar(
            "ENTRADA_REEMBOLSO_FALLIDO",
            "Fallo en reembolso de entrada " + entradaId + ": " + e.getMessage(),
            usuarioId,
            String.valueOf(entradaId),
            TIPO_ENTRADA
        );
        throw new PagoStripeException("Error al procesar el reembolso: " + e.getMessage());
    }

    return toDTO(entrada);
}

@Override
public List<EntradaResponseDTO> listarEntradasUsuario(String correo) {
    Usuario u = usuarioService.obtenerEntidadPorCorreo(correo); 
    return entradaRepository.findByUsuarioId(u.getId())
        .stream()
        .map(this::toDTO)
        .toList();
}
    @Override
    public EntradaResponseDTO obtenerEntrada(Long entradaId) {
        Entrada entrada = entradaRepository.findById(entradaId).orElseThrow(() -> new RuntimeException(ENTRADA_NO_ENCONTRADA));
        return toDTO(entrada);
    }

    @Override
    public void expirarReservasVencidas() {
        List<Entrada> vencidas = entradaRepository.findByEstadoAndTtlReservaLessThan(ESTADO_RESERVADA, LocalDateTime.now());

        for (int i = 0; i < vencidas.size(); i++) {
            Entrada entrada = vencidas.get(i);
            entrada.setEstado("EXPIRADA");
            entradaRepository.save(entrada);

            partidoService.actualizarCapacidad(entrada.getPartido().getId(), entrada.getCantidad());

            auditoriaService.registrar(
                "ENTRADA_EXPIRADA",
                "Entrada " + entrada.getId() + " expiró por TTL",
                entrada.getUsuario().getId(),
                String.valueOf(entrada.getId()),
                TIPO_ENTRADA
            );
        }
    }

    private EntradaResponseDTO toDTO(Entrada entrada) {
    EntradaResponseDTO dto = new EntradaResponseDTO();
    dto.setId(entrada.getId());
    dto.setUsuarioId(entrada.getUsuario().getId());
    dto.setPartidoId(entrada.getPartido().getId());
   dto.setEstado(entrada.getEstado());
    dto.setCantidad(entrada.getCantidad());
    dto.setPrecio(entrada.getPrecio());
    dto.setFechaCompra(entrada.getFechaCompra());
    dto.setTtlReserva(entrada.getTtlReserva());
    dto.setFechaPago(entrada.getFechaPago());
    dto.setFechaReembolso(entrada.getFechaReembolso());
    dto.setPaymentRef(entrada.getPaymentRef());
    return dto;
}
@Override
public List<PartidoCapacidadDTO> listarPartidosConCapacidad() {
    return partidoService.listarPartidosConCapacidad();
}
private Double calcularPrecio(Partido partido) {
    Long precioBase = PRECIO_POR_RONDA.getOrDefault(partido.getRonda(), 50000L);
    boolean hayTop = SELECCIONES_TOP.contains(partido.getSeleccionLocal()) 
                  || SELECCIONES_TOP.contains(partido.getSeleccionVisitante());
    if (hayTop) {
        precioBase = (long)(precioBase * 1.5);
    }
    return precioBase.doubleValue();
}
}