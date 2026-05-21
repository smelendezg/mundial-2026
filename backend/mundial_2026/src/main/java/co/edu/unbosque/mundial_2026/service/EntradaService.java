package co.edu.unbosque.mundial_2026.service;

import java.util.List;

import co.edu.unbosque.mundial_2026.dto.PartidoCapacidadDTO;
import co.edu.unbosque.mundial_2026.dto.request.EntradaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.EntradaResponseDTO;

public interface EntradaService {

    EntradaResponseDTO reservarEntrada(String correo, EntradaRequestDTO dto);

    EntradaResponseDTO confirmarPago(Long entradaId, String paymentRef);

    EntradaResponseDTO cancelarReserva(String correo, Long entradaId);

    EntradaResponseDTO transferirEntrada(Long entradaId, TransferenciaRequestDTO dto, String correo);

    EntradaResponseDTO reembolsarEntrada(String correo, Long entradaId);

    List<EntradaResponseDTO> listarEntradasUsuario(String correo);

    EntradaResponseDTO obtenerEntrada(Long entradaId);

    void expirarReservasVencidas();

    List<PartidoCapacidadDTO> listarPartidosConCapacidad();
}