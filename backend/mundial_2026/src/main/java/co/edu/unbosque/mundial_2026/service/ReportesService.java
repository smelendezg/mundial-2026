package co.edu.unbosque.mundial_2026.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import co.edu.unbosque.mundial_2026.dto.response.IngresoMetodoPagoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoMasApostadoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PollaRankingDTO;
import co.edu.unbosque.mundial_2026.dto.response.ProductoMasVendidoDTO;
import co.edu.unbosque.mundial_2026.dto.response.ReportesComprasDTO;
import co.edu.unbosque.mundial_2026.dto.response.ReportesResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.VentasPorCategoriaDTO;
import co.edu.unbosque.mundial_2026.repository.EntradaRepository;
import co.edu.unbosque.mundial_2026.repository.ItemOrdenRepository;
import co.edu.unbosque.mundial_2026.repository.OrdenRepository;
import co.edu.unbosque.mundial_2026.repository.ParticipacionRepository;
import co.edu.unbosque.mundial_2026.repository.PartidoRepository;
import co.edu.unbosque.mundial_2026.repository.PronosticoRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;

@Service
public class ReportesService {

    private final UsuarioRepository usuarioRepository;
    private final PartidoRepository partidoRepository;
    private final OrdenRepository ordenRepository;
    private final ItemOrdenRepository itemOrdenRepository;
    private final EntradaRepository entradaRepository;
    private final PronosticoRepository pronosticoRepository;
    private final ParticipacionRepository participacionRepository;

    public ReportesService(UsuarioRepository usuarioRepository,
            PartidoRepository partidoRepository,
            OrdenRepository ordenRepository,
            ItemOrdenRepository itemOrdenRepository,
            EntradaRepository entradaRepository,
            PronosticoRepository pronosticoRepository,
            ParticipacionRepository participacionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.partidoRepository = partidoRepository;
        this.ordenRepository = ordenRepository;
        this.itemOrdenRepository = itemOrdenRepository;
        this.entradaRepository = entradaRepository;
        this.pronosticoRepository = pronosticoRepository;
        this.participacionRepository = participacionRepository;
    }

    public ReportesResponseDTO obtenerEstadisticasGenerales() {
        ReportesResponseDTO dto = new ReportesResponseDTO();
        dto.setTotalUsuarios((int) usuarioRepository.count());
        dto.setTotalPartidos((int) partidoRepository.count());
        dto.setTotalTransacciones((int) ordenRepository.count());
        dto.setUsuariosActivosHoy(calcularUsuariosActivosHoy());
        return dto;
    }

    public ReportesComprasDTO obtenerReportesCompras() {
        ReportesComprasDTO dto = new ReportesComprasDTO();

        Double ingreso = ordenRepository.sumIngresoTotal();
        dto.setIngresoTotal(ingreso != null ? ingreso : 0.0);
        dto.setTotalOrdenes((int) ordenRepository.count());

        Long entradas = entradaRepository.sumEntradasVendidas();
        dto.setTotalEntradasVendidas(entradas != null ? entradas : 0L);

        List<ProductoMasVendidoDTO> productos = itemOrdenRepository
                .findTopProductosMasVendidos(PageRequest.of(0, 5))
                .stream()
                .map(row -> new ProductoMasVendidoDTO(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).intValue(),
                        ((Number) row[4]).doubleValue()))
                .collect(Collectors.toList());
        dto.setProductosMasVendidos(productos);

        List<VentasPorCategoriaDTO> porCategoria = itemOrdenRepository
                .findVentasPorCategoria()
                .stream()
                .map(row -> new VentasPorCategoriaDTO(
                        (String) row[0],
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).doubleValue()))
                .collect(Collectors.toList());
        dto.setVentasPorCategoria(porCategoria);

        return dto;
    }

    public List<PartidoMasApostadoDTO> obtenerPartidosMasApostados() {
        return pronosticoRepository
                .findPartidosMasApostados(PageRequest.of(0, 8))
                .stream()
                .map(row -> new PartidoMasApostadoDTO(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).intValue()))
                .collect(Collectors.toList());
    }

    public List<PollaRankingDTO> obtenerPollaRanking() {
        return participacionRepository
                .findPollaRanking(PageRequest.of(0, 8))
                .stream()
                .map(row -> new PollaRankingDTO(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).intValue()))
                .collect(Collectors.toList());
    }

    public List<IngresoMetodoPagoDTO> obtenerIngresosPorMetodoPago() {
        return ordenRepository
                .findIngresosPorMetodoPago()
                .stream()
                .map(row -> new IngresoMetodoPagoDTO(
                        (String) row[0],
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).doubleValue()))
                .collect(Collectors.toList());
    }

    private int calcularUsuariosActivosHoy() {
        return usuarioRepository.findByActivoTrue().size();
    }
}
