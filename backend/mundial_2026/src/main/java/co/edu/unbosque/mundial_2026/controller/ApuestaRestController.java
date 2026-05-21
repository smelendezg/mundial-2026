package co.edu.unbosque.mundial_2026.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unbosque.mundial_2026.dto.ApuestaDTO;
import co.edu.unbosque.mundial_2026.dto.ParticipacionDTO;
import co.edu.unbosque.mundial_2026.dto.PronosticoDTO;
import co.edu.unbosque.mundial_2026.dto.request.ApuestaRequestDTO;
import co.edu.unbosque.mundial_2026.dto.request.PronosticoRequestDTO;
import co.edu.unbosque.mundial_2026.service.ApuestaService;

@RestController
@RequestMapping("/api/apuestas")
public class ApuestaRestController {

    private final ApuestaService apuestaService;

    public ApuestaRestController(ApuestaService apuestaService) {
        this.apuestaService = apuestaService;
    }

    @PostMapping("/crear")
public ResponseEntity<ApuestaDTO> crearApuesta(@RequestBody ApuestaRequestDTO dto) {
    return ResponseEntity.ok(apuestaService.crearApuesta(dto));
}

   @PostMapping("/unirse/{usuarioId}")
public ResponseEntity<ApuestaDTO> unirseApuesta(@PathVariable Long usuarioId, @RequestBody String codigo) {
    String codigoLimpio = codigo.replace("\"", "").trim();
    return ResponseEntity.ok(apuestaService.unirseApuesta(codigoLimpio, usuarioId));
}
    @PostMapping("/pronostico")
public ResponseEntity<PronosticoDTO> registrarPronostico(@RequestBody PronosticoRequestDTO dto) {
    return ResponseEntity.ok(apuestaService.registrarPronostico(dto));
}

    @GetMapping("/ranking/{apuestaId}")
    public ResponseEntity<List<ParticipacionDTO>> obtenerRanking(@PathVariable Long apuestaId) {
        return ResponseEntity.ok(apuestaService.obtenerRanking(apuestaId));
    }

   @PreAuthorize("hasRole('ADMIN')")
@PostMapping("/cerrar/{apuestaId}")
public ResponseEntity<ApuestaDTO> cerrarApuesta(@PathVariable Long apuestaId) {
    return ResponseEntity.ok(apuestaService.cerrarApuesta(apuestaId));
}
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/puntos/{apuestaId}")
public ResponseEntity<List<PronosticoDTO>> calcularPuntos(@PathVariable Long apuestaId) {
    return ResponseEntity.ok(apuestaService.calcularPuntos(apuestaId));
}

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ApuestaDTO>> listarApuestasPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(apuestaService.listarApuestasPorUsuario(usuarioId));
    }

    @GetMapping("/{apuestaId}")
    public ResponseEntity<ApuestaDTO> obtenerApuesta(@PathVariable Long apuestaId) {
        return ResponseEntity.ok(apuestaService.obtenerApuesta(apuestaId));
    }

    @GetMapping("/participantes/{apuestaId}")
    public ResponseEntity<List<ParticipacionDTO>> listarParticipantes(@PathVariable Long apuestaId) {
        return ResponseEntity.ok(apuestaService.listarParticipantes(apuestaId));
    }

    @GetMapping("/verificar/{pronosticoId}")
    public ResponseEntity<PronosticoDTO> verificarPronostico(@PathVariable Long pronosticoId) {
        return ResponseEntity.ok(apuestaService.verificarPronostico(pronosticoId));
    }

    
    @GetMapping("/mis-pronosticos/{apuestaId}/{usuarioId}")
public ResponseEntity<List<PronosticoDTO>> misPronosticos(
        @PathVariable Long apuestaId, @PathVariable Long usuarioId) {
    return ResponseEntity.ok(apuestaService.misPronosticos(apuestaId, usuarioId));
}

@PutMapping("/pronostico/{pronosticoId}")
public ResponseEntity<PronosticoDTO> editarPronostico(
        @PathVariable Long pronosticoId, @RequestBody PronosticoRequestDTO dto) {
    return ResponseEntity.ok(apuestaService.editarPronostico(pronosticoId, dto));
}

@DeleteMapping("/pronostico/{pronosticoId}")
public ResponseEntity<Void> eliminarPronostico(@PathVariable Long pronosticoId) {
    apuestaService.eliminarPronostico(pronosticoId);
    return ResponseEntity.noContent().build();
}
@GetMapping("/puntos-parciales/{apuestaId}")
public ResponseEntity<List<PronosticoDTO>> calcularPuntosParciales(@PathVariable Long apuestaId) {
    return ResponseEntity.ok(apuestaService.calcularPuntosParciales(apuestaId));
}
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/todas")
public ResponseEntity<List<ApuestaDTO>> listarTodas() {
    return ResponseEntity.ok(apuestaService.listarTodas());
}

@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{apuestaId}")
public ResponseEntity<Void> eliminarApuesta(@PathVariable Long apuestaId) {
    apuestaService.eliminarApuesta(apuestaId);
    return ResponseEntity.noContent().build();
}
}