package co.edu.unbosque.mundial_2026.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.mundial_2026.dto.request.AgregarItemDTO;
import co.edu.unbosque.mundial_2026.dto.request.ConfirmarOrdenDTO;
import co.edu.unbosque.mundial_2026.dto.response.OrdenResponseDTO;
import co.edu.unbosque.mundial_2026.service.OrdenService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    private final OrdenService ordenService;

    public OrdenController(OrdenService ordenService) {
        this.ordenService = ordenService;
    }

    @PostMapping("/carrito/agregar")
    public ResponseEntity<OrdenResponseDTO> agregar(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody AgregarItemDTO dto) {
        return ResponseEntity.ok(ordenService.agregarItem(username, dto));
    }

    @GetMapping("/carrito")
    public ResponseEntity<OrdenResponseDTO> carrito(
            @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(ordenService.obtenerCarrito(username));
    }

    @DeleteMapping("/carrito/item/{itemId}")
    public ResponseEntity<OrdenResponseDTO> eliminarItem(
            @AuthenticationPrincipal String username,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(ordenService.eliminarItem(username, itemId));
    }

    @PostMapping("/carrito/confirmar")
    public ResponseEntity<OrdenResponseDTO> confirmar(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody ConfirmarOrdenDTO dto) {
        return ResponseEntity.ok(ordenService.confirmarOrden(username, dto));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<OrdenResponseDTO>> historial(
            @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(ordenService.historial(username));
    }

    @DeleteMapping("/carrito")
    public ResponseEntity<OrdenResponseDTO> cancelar(
            @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(ordenService.cancelarOrden(username));
    }
}