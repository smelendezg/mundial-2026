package co.edu.unbosque.mundial_2026.service;

import java.util.List;

import co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.MetodoPagoResponseDTO;
import co.edu.unbosque.mundial_2026.entity.MetodoPago;
//Falta revisar y decidir cual usar en realidad ya que los 2 primeros no revisan bien el token a diferencia de los ultimos 2
public interface MetodoPagoService {
    MetodoPagoResponseDTO agregar(MetodoPagoRequestDTO dto);
    List<MetodoPagoResponseDTO> listarPorUsuario(Long usuarioId);
    boolean setDefault(Long usuarioId, Long metodoPagoId);
    MetodoPago obtenerEntidadPorId(Long id);
    MetodoPagoResponseDTO agregar(String correo, MetodoPagoRequestDTO dto);
List<MetodoPagoResponseDTO> listarPorCorreo(String correo);
void setDefaultPorCorreo(String correo, Long metodoPagoId);
}