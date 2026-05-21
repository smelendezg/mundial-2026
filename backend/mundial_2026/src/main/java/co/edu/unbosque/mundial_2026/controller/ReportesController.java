package co.edu.unbosque.mundial_2026.controller;

import co.edu.unbosque.mundial_2026.dto.response.IngresoMetodoPagoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoMasApostadoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PollaRankingDTO;
import co.edu.unbosque.mundial_2026.dto.response.ReportesComprasDTO;
import co.edu.unbosque.mundial_2026.dto.response.ReportesResponseDTO;
import co.edu.unbosque.mundial_2026.service.ReportesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    private final ReportesService reportesService;

    public ReportesController(ReportesService reportesService) {
        this.reportesService = reportesService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/estadisticas-generales")
    public ResponseEntity<ReportesResponseDTO> obtenerEstadisticasGenerales() {
        return ResponseEntity.ok(reportesService.obtenerEstadisticasGenerales());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/compras")
    public ResponseEntity<ReportesComprasDTO> obtenerReportesCompras() {
        return ResponseEntity.ok(reportesService.obtenerReportesCompras());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/partidos-apostados")
    public ResponseEntity<List<PartidoMasApostadoDTO>> obtenerPartidosMasApostados() {
        return ResponseEntity.ok(reportesService.obtenerPartidosMasApostados());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pollas")
    public ResponseEntity<List<PollaRankingDTO>> obtenerPollaRanking() {
        return ResponseEntity.ok(reportesService.obtenerPollaRanking());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/metodos-pago")
    public ResponseEntity<List<IngresoMetodoPagoDTO>> obtenerIngresosPorMetodoPago() {
        return ResponseEntity.ok(reportesService.obtenerIngresosPorMetodoPago());
    }
}
