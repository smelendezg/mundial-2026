package co.edu.unbosque.mundial_2026.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.mundial_2026.dto.PartidoCapacidadDTO;
import co.edu.unbosque.mundial_2026.dto.request.EntradaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.TransferenciaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.EntradaResponseDTO;
import co.edu.unbosque.mundial_2026.service.EntradaService;

@RestController
@RequestMapping("/api/entradas")
public class EntradaRestController {

    private final EntradaService entradaService;

    public EntradaRestController(EntradaService entradaService) {
        this.entradaService = entradaService;
    }

    @PostMapping("/reservar")
    public ResponseEntity<EntradaResponseDTO> reservar(
            @AuthenticationPrincipal String username,
            @RequestBody EntradaRequestDTO dto) {
        return ResponseEntity.ok(entradaService.reservarEntrada(username, dto));
    }

    @PatchMapping("/pagar/{entradaId}")
    public ResponseEntity<EntradaResponseDTO> pagar(
            @PathVariable Long entradaId,
            @RequestParam String paymentRef) {
        return ResponseEntity.ok(entradaService.confirmarPago(entradaId, paymentRef));
    }

    @PatchMapping("/cancelar/{entradaId}")
    public ResponseEntity<EntradaResponseDTO> cancelar(
            @AuthenticationPrincipal String username,
            @PathVariable Long entradaId) {
        return ResponseEntity.ok(entradaService.cancelarReserva(username, entradaId));
    }

    @PatchMapping("/transferir/{entradaId}")
    public ResponseEntity<EntradaResponseDTO> transferir(
            @AuthenticationPrincipal String username,
            @PathVariable Long entradaId,
            @RequestBody TransferenciaRequestDTO dto) {
        return ResponseEntity.ok(entradaService.transferirEntrada(entradaId, dto, username));
    }

    @PatchMapping("/reembolsar/{entradaId}")
    public ResponseEntity<EntradaResponseDTO> reembolsar(
            @AuthenticationPrincipal String username,
            @PathVariable Long entradaId) {
        return ResponseEntity.ok(entradaService.reembolsarEntrada(username, entradaId));
    }

    @GetMapping("/usuario")
    public ResponseEntity<List<EntradaResponseDTO>> listar(
            @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(entradaService.listarEntradasUsuario(username));
    }

    @GetMapping("/{entradaId}")
    public ResponseEntity<EntradaResponseDTO> obtener(@PathVariable Long entradaId) {
        return ResponseEntity.ok(entradaService.obtenerEntrada(entradaId));
    }

    @GetMapping("/partidos")
    public ResponseEntity<List<PartidoCapacidadDTO>> listarPartidos() {
        return ResponseEntity.ok(entradaService.listarPartidosConCapacidad());
    }
}