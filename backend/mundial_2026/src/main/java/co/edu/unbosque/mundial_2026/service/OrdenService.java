package co.edu.unbosque.mundial_2026.service;

import java.util.List;
import co.edu.unbosque.mundial_2026.dto.request.AgregarItemDTO;
import co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO;
import co.edu.unbosque.mundial_2026.dto.response.OrdenResponseDTO;

public interface OrdenService {
   OrdenResponseDTO agregarItem(String correo, AgregarItemDTO dto);
OrdenResponseDTO obtenerCarrito(String correo);
OrdenResponseDTO eliminarItem(String correo, Long itemId);
OrdenResponseDTO confirmarOrden(String correo, ConfirmarOrdenDTO dto);
List<OrdenResponseDTO> historial(String correo);
OrdenResponseDTO cancelarOrden(String correo);
    
}