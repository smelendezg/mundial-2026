package co.edu.unbosque.mundial_2026.controller;


import java.util.List;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.MetodoPagoResponseDTO;
import co.edu.unbosque.mundial_2026.service.MetodoPagoService;

@RestController
@RequestMapping("/payments")
public class MetodoPagoController {

    private final MetodoPagoService metodoPagoService;

    public MetodoPagoController(MetodoPagoService metodoPagoService) {
        this.metodoPagoService = metodoPagoService;
    }

    @GetMapping
public ResponseEntity<List<MetodoPagoResponseDTO>> listar(
        @AuthenticationPrincipal String username) {
    return ResponseEntity.ok(metodoPagoService.listarPorCorreo(username));
}

@PostMapping
public ResponseEntity<MetodoPagoResponseDTO> agregar(
        @AuthenticationPrincipal String username,
        @RequestBody MetodoPagoRequestDTO dto) {
    MetodoPagoResponseDTO resultado = metodoPagoService.agregar(username, dto);
    if (resultado == null) {
        return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.ok(resultado);
}
@PatchMapping("/{id}/default")
public ResponseEntity<Void> setDefault(
        @AuthenticationPrincipal String username,
        @PathVariable Long id) {
    metodoPagoService.setDefaultPorCorreo(username, id);
    return ResponseEntity.noContent().build();
}
  
}