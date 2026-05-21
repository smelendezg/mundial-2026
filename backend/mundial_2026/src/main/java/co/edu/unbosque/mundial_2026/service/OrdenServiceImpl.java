package co.edu.unbosque.mundial_2026.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import co.edu.unbosque.mundial_2026.dto.request.AgregarItemDTO;
import co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO;
import co.edu.unbosque.mundial_2026.dto.response.ItemOrdenResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.OrdenResponseDTO;
import co.edu.unbosque.mundial_2026.entity.ItemOrden;
import co.edu.unbosque.mundial_2026.entity.MetodoPago;
import co.edu.unbosque.mundial_2026.entity.Orden;
import co.edu.unbosque.mundial_2026.entity.Producto;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.CarritoVacioException;
import co.edu.unbosque.mundial_2026.exception.ItemNotFoundException;
import co.edu.unbosque.mundial_2026.exception.MetodoPagoInvalidoException;
import co.edu.unbosque.mundial_2026.exception.OrdenNotFoundException;
import co.edu.unbosque.mundial_2026.exception.PagoStripeException;
import co.edu.unbosque.mundial_2026.exception.ProductoNotFoundException;
import co.edu.unbosque.mundial_2026.exception.StockInsuficienteException;
import co.edu.unbosque.mundial_2026.repository.ItemOrdenRepository;

import co.edu.unbosque.mundial_2026.repository.OrdenRepository;


@Service
public class OrdenServiceImpl implements OrdenService {

    private final OrdenRepository ordenRepository;
    private final ItemOrdenRepository itemOrdenRepository;
    private final UsuarioService usuarioService;
    private final ProductoService productoService;
    private final MetodoPagoService metodoPagoService;
    private final EventoAuditoriaService auditoriaService;
    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_PAGADA = "PAGADA";
    private static final String ESTADO_CANCELADA = "CANCELADA";
    private static final String TIPO_ORDEN = "Orden";
    private static final String PREFIJO_ORDEN = "ORDEN-";
    private static final String CARRITO_NO_ACTIVO = "No tienes un carrito activo";
    private static final String PREFIJO_USUARIO = "Usuario ";

   
    public OrdenServiceImpl(OrdenRepository ordenRepository,
            ItemOrdenRepository itemOrdenRepository,
            UsuarioService usuarioService,
            ProductoService productoService,
            MetodoPagoService metodoPagoService,
            EventoAuditoriaService auditoriaService,@Value("${stripe.api.key}") String stripeApiKey) {
        this.ordenRepository = ordenRepository;
        this.itemOrdenRepository = itemOrdenRepository;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
        this.metodoPagoService = metodoPagoService;
        this.auditoriaService = auditoriaService;
        Stripe.apiKey = stripeApiKey;
    }

    @Override
    public OrdenResponseDTO agregarItem(String correo, AgregarItemDTO dto) {
        Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo); 
        Long usuarioId = usuario.getId();
        Producto producto = productoService.obtenerEntidadPorId(dto.getProductoId());
        if (producto.getStock() < dto.getCantidad()) {
            throw new StockInsuficienteException("Error no hay stock");
        }
       if (Boolean.FALSE.equals(producto.getActivo())) {
    throw new ProductoNotFoundException("Este producto no está disponible");
}
        Optional<Orden> orden = ordenRepository.findByUsuarioIdAndEstado(usuarioId, ESTADO_PENDIENTE);
        Orden ordenActual;
        if (orden.isPresent()) {
            ordenActual = orden.get();
        } else {
            Orden ordenNueva = new Orden();
            ordenNueva.setUsuario(usuario);
            ordenNueva.setEstado(ESTADO_PENDIENTE);
            ordenNueva.setFechaCreacion(LocalDateTime.now());
            ordenNueva.setTotal(0.0);
            ordenActual = ordenRepository.save(ordenNueva);
        }
        Optional<ItemOrden> item = itemOrdenRepository.findByOrdenIdAndProductoId(ordenActual.getId(), producto.getId());
        ItemOrden itemOrdenActual;
        if (item.isPresent()) {
            itemOrdenActual = item.get();
            itemOrdenActual.setCantidad(itemOrdenActual.getCantidad() + dto.getCantidad());
            itemOrdenActual.setPrecioUnitario(itemOrdenActual.getPrecioUnitario());
        } else {
            itemOrdenActual = new ItemOrden();
            itemOrdenActual.setOrden(ordenActual);
            itemOrdenActual.setProducto(producto);
            itemOrdenActual.setCantidad(dto.getCantidad());
            itemOrdenActual.setPrecioUnitario(producto.getPrecio());
        }
        itemOrdenRepository.save(itemOrdenActual);
        List<ItemOrden> items = itemOrdenRepository.findByOrdenId(ordenActual.getId());
        double total = 0.0;
        for (int i = 0; i < items.size(); i++) {
            ItemOrden itemactual = items.get(i);
            total += itemactual.getCantidad() * itemactual.getPrecioUnitario();
        }
        ordenActual.setTotal(total);
        ordenRepository.save(ordenActual);
        auditoriaService.registrar(
                "ITEM_AGREGADO_CARRITO",
                PREFIJO_USUARIO + usuarioId + " agregó " + dto.getCantidad() + " x " + producto.getNombre(),
                usuarioId,
                PREFIJO_ORDEN + ordenActual.getId(),
                TIPO_ORDEN);
        return toOrdenDTO(ordenActual, items);
    }

    @Override
    public OrdenResponseDTO obtenerCarrito(String correo) {
        Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo); 
        Orden orden = ordenRepository.findByUsuarioIdAndEstado(usuario.getId(), ESTADO_PENDIENTE)
                .orElseThrow(() -> new OrdenNotFoundException(CARRITO_NO_ACTIVO));
        List<ItemOrden> items = itemOrdenRepository.findByOrdenId(orden.getId());
        return toOrdenDTO(orden, items);
    }

    @Override
    public OrdenResponseDTO eliminarItem(String correo, Long itemId) {
        Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo); 
        Orden ordenActual = ordenRepository.findByUsuarioIdAndEstado(usuario.getId(), ESTADO_PENDIENTE)
                .orElseThrow(() -> new OrdenNotFoundException("Usuario no tiene orden activa"));
        ItemOrden itemaEliminar = itemOrdenRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException("No existe ese item"));
        itemOrdenRepository.delete(itemaEliminar);
        ordenActual.setTotal(ordenActual.getTotal() - (itemaEliminar.getCantidad() * itemaEliminar.getPrecioUnitario()));
        List<ItemOrden> itemsRestantes = itemOrdenRepository.findByOrdenId(ordenActual.getId());
        if (itemsRestantes.isEmpty()) {
            ordenRepository.delete(ordenActual);
            return toOrdenDTO(ordenActual, itemsRestantes);
        }
        ordenRepository.save(ordenActual);
        return toOrdenDTO(ordenActual, itemsRestantes);
    }

    @Override
    public OrdenResponseDTO confirmarOrden(String correo, ConfirmarOrdenDTO dto) {
        Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo); 
        Long usuarioId = usuario.getId();
        Orden ordenAPagar = ordenRepository.findByUsuarioIdAndEstado(usuarioId, ESTADO_PENDIENTE)
                .orElseThrow(() -> new OrdenNotFoundException(CARRITO_NO_ACTIVO));
        List<ItemOrden> items = itemOrdenRepository.findByOrdenId(ordenAPagar.getId());
        if (items.isEmpty()) {
            throw new CarritoVacioException("El carrito está vacío");
        }
        MetodoPago metodoPago = metodoPagoService.obtenerEntidadPorId(dto.getMetodoPagoId());
        if (!metodoPago.getUsuario().getId().equals(usuarioId)) {
            throw new MetodoPagoInvalidoException("El método de pago no pertenece al usuario");
        }
        for (int i = 0; i < items.size(); i++) {
            ItemOrden item = items.get(i);
            if (item.getProducto().getStock() < item.getCantidad()) {
                throw new StockInsuficienteException("Stock insuficiente para " + item.getProducto().getNombre());
            }
        }
        try {
           
            long totalCentavos = (long) (ordenAPagar.getTotal() * 100);
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(totalCentavos)
                    .setCurrency("usd")
                    .setPaymentMethod(metodoPago.getDetails())
                    .setConfirm(true)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(
                                            PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                    .build())
                    .build();
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            ordenAPagar.setEstado(ESTADO_PAGADA);
            ordenAPagar.setFechaPago(LocalDateTime.now());
            ordenAPagar.setPaymentRef(paymentIntent.getId());
            ordenAPagar.setMetodoPago(metodoPago);
            for (int i = 0; i < items.size(); i++) {
                ItemOrden item = items.get(i);
                Producto producto = item.getProducto();
                producto.setStock(producto.getStock() - item.getCantidad());
                productoService.actualizarStock(item.getProducto().getId(), item.getCantidad());
            }
            ordenRepository.save(ordenAPagar);
            auditoriaService.registrar(
                    "ORDEN_PAGADA",
                    PREFIJO_USUARIO + usuarioId + " pagó la orden " + ordenAPagar.getId() + " por $" + ordenAPagar.getTotal(),
                    usuarioId,
                    PREFIJO_ORDEN + ordenAPagar.getId(),
                    TIPO_ORDEN);
        } catch (StripeException e) {
            throw new PagoStripeException("Error al procesar el pago: " + e.getMessage());
        }
        return toOrdenDTO(ordenAPagar, items);
    }

    @Override
    public List<OrdenResponseDTO> historial(String correo) {
        Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo); 
        List<Orden> ordenes = ordenRepository.findByUsuarioIdAndEstadoNot(usuario.getId(), ESTADO_PENDIENTE);
        List<OrdenResponseDTO> responseDTOs = new ArrayList<>();
        for (int i = 0; i < ordenes.size(); i++) {
            Orden orden = ordenes.get(i);
            List<ItemOrden> items = itemOrdenRepository.findByOrdenId(orden.getId());
            responseDTOs.add(toOrdenDTO(orden, items));
        }
        return responseDTOs;
    }

    @Override
    public OrdenResponseDTO cancelarOrden(String correo) {
        Usuario usuario = usuarioService.obtenerEntidadPorCorreo(correo); 
        Orden orden = ordenRepository.findByUsuarioIdAndEstado(usuario.getId(), ESTADO_PENDIENTE)
                .orElseThrow(() -> new OrdenNotFoundException(CARRITO_NO_ACTIVO));
        List<ItemOrden> items = itemOrdenRepository.findByOrdenId(orden.getId());
        orden.setEstado(ESTADO_CANCELADA);
        ordenRepository.save(orden);
        auditoriaService.registrar(
                "ORDEN_CANCELADA",
                PREFIJO_USUARIO + usuario.getId() + " canceló la orden " + orden.getId(),
                usuario.getId(),
                PREFIJO_ORDEN + orden.getId(),
                TIPO_ORDEN);
        return toOrdenDTO(orden, items);
    }

    private ItemOrdenResponseDTO toItemDTO(ItemOrden item) {
        ItemOrdenResponseDTO response = new ItemOrdenResponseDTO();
        response.setId(item.getId());
        response.setProductoId(item.getProducto().getId());
        response.setProductoNombre(item.getProducto().getNombre());
        response.setProductoImagenUrl(item.getProducto().getImagenUrl());
        response.setCantidad(item.getCantidad());
        response.setPrecioUnitario(item.getPrecioUnitario());
        response.setSubtotal(item.getCantidad() * item.getPrecioUnitario());
        return response;
    }

    private OrdenResponseDTO toOrdenDTO(Orden orden, List<ItemOrden> items) {
        OrdenResponseDTO response = new OrdenResponseDTO();
        response.setId(orden.getId());
        response.setEstado(orden.getEstado());
        response.setTotal(orden.getTotal());
        response.setFechaCreacion(orden.getFechaCreacion());
        response.setFechaPago(orden.getFechaPago());
        response.setPaymentRef(orden.getPaymentRef());
        if (orden.getMetodoPago() != null) {
            response.setMetodoPagoLabel(orden.getMetodoPago().getLabel());
        }
        List<ItemOrdenResponseDTO> itemDTOs = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            itemDTOs.add(toItemDTO(items.get(i)));
        }
        response.setItems(itemDTOs);
        return response;
    }
}