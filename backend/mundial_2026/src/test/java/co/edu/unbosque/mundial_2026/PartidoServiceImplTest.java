package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClient.RequestHeadersUriSpec;
import org.springframework.web.client.RestClient.RequestHeadersSpec;
import org.springframework.web.client.RestClient.ResponseSpec;

import co.edu.unbosque.mundial_2026.dto.response.EquipoConEstadioDTO;
import co.edu.unbosque.mundial_2026.dto.response.EquipoDTO;

import co.edu.unbosque.mundial_2026.dto.response.EstadioDTO;
import co.edu.unbosque.mundial_2026.dto.response.EstadoDTO;
import co.edu.unbosque.mundial_2026.dto.response.InfoPartidoDTO;

import co.edu.unbosque.mundial_2026.dto.response.LigaDTO;
import co.edu.unbosque.mundial_2026.dto.response.MarcadorDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoDTO;
import co.edu.unbosque.mundial_2026.dto.response.PartidoResponseDTO;
import co.edu.unbosque.mundial_2026.dto.response.PreferenciaDTO;
import co.edu.unbosque.mundial_2026.entity.Partido;
import co.edu.unbosque.mundial_2026.exception.PartidoNotFoundException;
import co.edu.unbosque.mundial_2026.repository.PartidoRepository;
import co.edu.unbosque.mundial_2026.service.PartidoServiceImpl;
import co.edu.unbosque.mundial_2026.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
public class PartidoServiceImplTest {

    @Mock
    private RestClient footballClient;

    @Mock
    private RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private RequestHeadersSpec requestHeadersSpec;

    @Mock
    private ResponseSpec responseSpec;

    @Mock
    private PartidoRepository partidoRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private PartidoServiceImpl service;

    // ── Helper para mockear la cadena RestClient ──────────────────────────
    private void mockRestClient(Object responseBody) {
        when(footballClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(String.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(any(Class.class))).thenReturn(responseBody);
    }

    private PartidoDTO crearPartidoDTO() {
        InfoPartidoDTO info = new InfoPartidoDTO();
        info.setId(1L);

        EstadioDTO estadio = new EstadioDTO();
        estadio.setNombre("MetLife Stadium");
        estadio.setCiudad("Nueva York");
        info.setEstadio(estadio);

        EstadoDTO estado = new EstadoDTO();
        estado.setCodigo("NS");
        info.setEstado(estado);
        info.setFecha("2026-06-11T18:00:00+00:00");

        LigaDTO liga = new LigaDTO();
        liga.setRonda("Group Stage");

        EquipoDTO local = new EquipoDTO();
        local.setNombre("Colombia");
        EquipoDTO visitante = new EquipoDTO();
        visitante.setNombre("Mexico");

        EquipoConEstadioDTO equipos = new EquipoConEstadioDTO();
        equipos.setLocal(local);
        equipos.setVisitante(visitante);

        MarcadorDTO goles = new MarcadorDTO();
        goles.setLocal(null);
        goles.setVisitante(null);

        PartidoDTO dto = new PartidoDTO();
        dto.setInformacion(info);
        dto.setLiga(liga);
        dto.setEquipos(equipos);
        dto.setGoles(goles);

        return dto;
    }

    // ── CATÁLOGO DE PARTIDOS ──────────────────────────────────────────────

    @Test
    void obtenerPartidos_retornaLista() {
        // GIVEN
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        List<PartidoDTO> resultado = service.obtenerPartidos();

        // THEN
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    // ── PARTIDOS POR EQUIPO ───────────────────────────────────────────────

    @Test
    void obtenerPartidosPorEquipo_retornaLista() {
        // GIVEN
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        List<PartidoDTO> resultado = service.obtenerPartidosPorEquipo(1L);

        // THEN
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    // ── PARTIDO POR ID ────────────────────────────────────────────────────

    @Test
    void obtenerPartidoPorId_existente_retornaDTO() {
        // GIVEN
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        PartidoDTO resultado = service.obtenerPartidoPorId(1L);

        // THEN
        assertNotNull(resultado);
        assertEquals(1L, resultado.getInformacion().getId());
    }

    @Test
    void obtenerPartidoPorId_noExistente_lanzaExcepcion() {
        // GIVEN
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of());
        mockRestClient(response);

        // WHEN + THEN
        assertThrows(PartidoNotFoundException.class,
                () -> service.obtenerPartidoPorId(99L));
    }

    // ── PARTIDOS EN VIVO ──────────────────────────────────────────────────

    @Test
    void obtenerPartidosEnVivo_retornaLista() {
        // GIVEN
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        List<PartidoDTO> resultado = service.obtenerPartidosEnVivo();

        // THEN
        assertNotNull(resultado);
    }

    // ── PARTIDOS POR FECHA ────────────────────────────────────────────────

    @Test
    void obtenerPartidosPorFecha_retornaLista() {
        // GIVEN
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        List<PartidoDTO> resultado = service.obtenerPartidosPorFecha("2026-06-11");

        // THEN
        assertNotNull(resultado);
    }

    // ── SINCRONIZAR ───────────────────────────────────────────────────────

    @Test
    void sincronizarDesdeAPI_apiVacia_retornaCero() {
        // GIVEN
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of());
        mockRestClient(response);

        // WHEN
        int resultado = service.sincronizarDesdeAPI();

        // THEN
        assertEquals(0, resultado);
    }

    @Test
    void sincronizarDesdeAPI_apiNull_retornaCero() {
        // GIVEN
        mockRestClient(null);

        // WHEN
        int resultado = service.sincronizarDesdeAPI();

        // THEN
        assertEquals(0, resultado);
    }

    // ── ACTUALIZAR RESULTADO ──────────────────────────────────────────────

    @Test
    void actualizarResultado_partidoExistente_retornaUno() {
        // GIVEN
        Partido partido = new Partido();
        partido.setId(1L);

        when(partidoRepository.findById(1L)).thenReturn(Optional.of(partido));
        when(partidoRepository.save(any(Partido.class))).thenReturn(partido);

        // WHEN
        int resultado = service.actualizarResultado(1L, 2, 1, 90);

        // THEN
        assertEquals(1, resultado);
        assertEquals(2, partido.getGolesLocal());
        assertEquals(1, partido.getGolesVisitante());
    }

    @Test
    void actualizarResultado_partidoNoExistente_lanzaExcepcion() {
        // GIVEN
        when(partidoRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN + THEN
        assertThrows(PartidoNotFoundException.class,
                () -> service.actualizarResultado(99L, 1, 0, 90));
    }

    // ── FILTRAR POR PREFERENCIAS ──────────────────────────────────────────

    @Test
    void obtenerPartidosPorSeleccionesFav_retornaLista() {
        // GIVEN
        PreferenciaDTO pref = new PreferenciaDTO(1L, "Colombia");
        when(usuarioService.seleccionesUsuario("seb@test.com")).thenReturn(List.of(pref));

        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        List<PartidoDTO> resultado = service.obtenerPartidosPorSeleccionesFav("seb@test.com");

        // THEN
        assertNotNull(resultado);
    }

    @Test
    void obtenerPartidosPorEstadiosFav_retornaLista() {
        // GIVEN
        PreferenciaDTO pref = new PreferenciaDTO(1L, "MetLife Stadium");
        when(usuarioService.estadiosUsuario("seb@test.com")).thenReturn(List.of(pref));

        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        List<PartidoDTO> resultado = service.obtenerPartidosPorEstadiosFav("seb@test.com");

        // THEN
        assertNotNull(resultado);
    }

    @Test
    void obtenerPartidosPorCiudadesFav_retornaLista() {
        // GIVEN
        PreferenciaDTO pref = new PreferenciaDTO(1L, "Nueva York");
        when(usuarioService.ciudadesUsuario("seb@test.com")).thenReturn(List.of(pref));

        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        // WHEN
        List<PartidoDTO> resultado = service.obtenerPartidosPorCiudadesFav("seb@test.com");

        // THEN
        assertNotNull(resultado);
    }
}