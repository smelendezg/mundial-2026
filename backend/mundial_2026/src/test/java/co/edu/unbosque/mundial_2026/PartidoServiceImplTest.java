package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
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
import co.edu.unbosque.mundial_2026.entity.CiudadFavorita;
import co.edu.unbosque.mundial_2026.entity.EstadioFavorito;
import co.edu.unbosque.mundial_2026.entity.Partido;
import co.edu.unbosque.mundial_2026.entity.Seleccion;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.PartidoNotFoundException;
import co.edu.unbosque.mundial_2026.exception.UsuarioNotFoundException;
import co.edu.unbosque.mundial_2026.repository.CiudadRepository;
import co.edu.unbosque.mundial_2026.repository.EstadioRepository;
import co.edu.unbosque.mundial_2026.repository.PartidoRepository;
import co.edu.unbosque.mundial_2026.repository.SeleccionRepository;
import co.edu.unbosque.mundial_2026.repository.UsuarioRepository;
import co.edu.unbosque.mundial_2026.service.PartidoServiceImpl;

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
    private UsuarioRepository usuarioRepository;
    @Mock
    private SeleccionRepository seleccionRepository;
    @Mock
    private EstadioRepository estadioRepository;
    @Mock
    private CiudadRepository ciudadRepository;

    @InjectMocks
    private PartidoServiceImpl service;

    private void mockRestClient(Object responseBody) {
        when(footballClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(String.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(any(Class.class))).thenReturn(responseBody);
    }

    private PartidoDTO crearPartidoDTO() {
        InfoPartidoDTO info = new InfoPartidoDTO();
        info.setId(1L);
        info.setFecha("2026-06-11T18:00:00+00:00");

        EstadioDTO estadio = new EstadioDTO();
        estadio.setNombre("MetLife Stadium");
        estadio.setCiudad("Nueva York");
        info.setEstadio(estadio);

        EstadoDTO estado = new EstadoDTO();
        estado.setCodigo("NS");
        info.setEstado(estado);

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

    private Usuario crearUsuario(String correo) {
        Usuario usuario = new Usuario();
        usuario.setCorreoUsuario(correo);
        usuario.setSeleccionesU(new ArrayList<>());
        usuario.setPreferenciasu(new ArrayList<>());
        usuario.setCiudadFavoritas(new ArrayList<>());
        return usuario;
    }

    @Test
    void obtenerPartidos_retornaLista() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        List<PartidoDTO> resultado = service.obtenerPartidos();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void obtenerPartidosPorEquipo_retornaLista() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        List<PartidoDTO> resultado = service.obtenerPartidosPorEquipo(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void obtenerPartidoPorId_existente_retornaDTO() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        PartidoDTO resultado = service.obtenerPartidoPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getInformacion().getId());
    }

    @Test
    void obtenerPartidoPorId_noExistente_lanzaExcepcion() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of());
        mockRestClient(response);

        assertThrows(PartidoNotFoundException.class, () -> service.obtenerPartidoPorId(99L));
    }

    @Test
    void obtenerPartidosEnVivo_retornaLista() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        List<PartidoDTO> resultado = service.obtenerPartidosEnVivo();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void obtenerPartidosPorFecha_retornaLista() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        List<PartidoDTO> resultado = service.obtenerPartidosPorFecha("2026-06-11");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void sincronizarDesdeAPI_apiVacia_retornaCero() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of());
        mockRestClient(response);

        int resultado = service.sincronizarDesdeAPI();

        assertEquals(0, resultado);
    }

    @Test
    void sincronizarDesdeAPI_apiNull_retornaCero() {
        mockRestClient(null);

        int resultado = service.sincronizarDesdeAPI();

        assertEquals(0, resultado);
    }

    @Test
    void sincronizarDesdeAPI_conPartidos_guardaYRetornaConteo() {
        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));
        mockRestClient(response);

        when(partidoRepository.saveAll(anyList())).thenReturn(List.of(new Partido()));

        int resultado = service.sincronizarDesdeAPI();

        assertEquals(1, resultado);
        verify(partidoRepository).saveAll(anyList());
    }

    @Test
    void actualizarResultado_partidoExistente_retornaUno() {
        Partido partido = new Partido();
        partido.setId(1L);

        when(partidoRepository.findById(1L)).thenReturn(Optional.of(partido));
        when(partidoRepository.save(any(Partido.class))).thenReturn(partido);

        int resultado = service.actualizarResultado(1L, 2, 1, 90);

        assertEquals(1, resultado);
        assertEquals(2, partido.getGolesLocal());
        assertEquals(1, partido.getGolesVisitante());
        verify(partidoRepository).save(partido);
    }

    @Test
    void actualizarResultado_partidoNoExistente_lanzaExcepcion() {
        when(partidoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PartidoNotFoundException.class,
                () -> service.actualizarResultado(99L, 1, 0, 90));
    }

    @Test
    void obtenerPartidosPorSeleccionesFav_usuarioExistente_retornaLista() {
        Seleccion seleccion = new Seleccion();
        seleccion.setId(1L);
        seleccion.setNombre("Colombia");

        Usuario usuario = crearUsuario("seb@test.com");
        usuario.setSeleccionesU(List.of(seleccion));

        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));

        when(usuarioRepository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
        mockRestClient(response);

        List<PartidoDTO> resultado = service.obtenerPartidosPorSeleccionesFav("seb@test.com");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void obtenerPartidosPorSeleccionesFav_usuarioNoExistente_lanzaExcepcion() {
        when(usuarioRepository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.obtenerPartidosPorSeleccionesFav("noexiste@test.com"));
    }

    @Test
    void obtenerPartidosPorEstadiosFav_usuarioExistente_retornaLista() {
        EstadioFavorito estadio = new EstadioFavorito();
        estadio.setId(1L);
        estadio.setNombre("MetLife Stadium");

        Usuario usuario = crearUsuario("seb@test.com");
        usuario.setPreferenciasu(List.of(estadio));

        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));

        when(usuarioRepository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
        mockRestClient(response);

        List<PartidoDTO> resultado = service.obtenerPartidosPorEstadiosFav("seb@test.com");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void obtenerPartidosPorEstadiosFav_usuarioNoExistente_lanzaExcepcion() {
        when(usuarioRepository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.obtenerPartidosPorEstadiosFav("noexiste@test.com"));
    }

    @Test
    void obtenerPartidosPorCiudadesFav_usuarioExistente_retornaLista() {
        CiudadFavorita ciudad = new CiudadFavorita();
        ciudad.setId(1L);
        ciudad.setNombre("East Rutherford");

        Usuario usuario = crearUsuario("seb@test.com");
        usuario.setCiudadFavoritas(List.of(ciudad));

        PartidoResponseDTO response = new PartidoResponseDTO();
        response.setPartidos(List.of(crearPartidoDTO()));

        when(usuarioRepository.findByCorreoUsuario("seb@test.com")).thenReturn(Optional.of(usuario));
        mockRestClient(response);

        List<PartidoDTO> resultado = service.obtenerPartidosPorCiudadesFav("seb@test.com");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void obtenerPartidosPorCiudadesFav_usuarioNoExistente_lanzaExcepcion() {
        when(usuarioRepository.findByCorreoUsuario("noexiste@test.com")).thenReturn(Optional.empty());

        assertThrows(UsuarioNotFoundException.class,
                () -> service.obtenerPartidosPorCiudadesFav("noexiste@test.com"));
    }

    @Test
    void filtrarPorSeleccion_retornaLista() {
        Partido partido = new Partido();
        partido.setSeleccionLocal("Colombia");

        when(partidoRepository.findBySeleccion("Colombia")).thenReturn(List.of(partido));

        List<Partido> resultado = service.filtrarPorSeleccion("Colombia");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(partidoRepository).findBySeleccion("Colombia");
    }

    @Test
    void filtrarPorEstadio_retornaLista() {
        Partido partido = new Partido();
        partido.setEstadio("MetLife Stadium");

        when(partidoRepository.findByEstadio("MetLife Stadium")).thenReturn(List.of(partido));

        List<Partido> resultado = service.filtrarPorEstadio("MetLife Stadium");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(partidoRepository).findByEstadio("MetLife Stadium");
    }

    @Test
    void filtrarPorCiudad_retornaPartidosConEstadioEnCiudad() {
        Partido partido = new Partido();
        partido.setEstadio("MetLife Stadium");

        when(partidoRepository.findAll()).thenReturn(List.of(partido));

        List<Partido> resultado = service.filtrarPorCiudad("East Rutherford");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void filtrarPorCiudad_ciudadSinEstadio_retornaVacio() {
        Partido partido = new Partido();
        partido.setEstadio("MetLife Stadium");

        when(partidoRepository.findAll()).thenReturn(List.of(partido));

        List<Partido> resultado = service.filtrarPorCiudad("CiudadInexistente");

        assertNotNull(resultado);
        assertEquals(0, resultado.size());
    }

    @Test
    void obtenerCatalogoSelecciones_retornaLista() {
        Seleccion seleccion = new Seleccion();
        seleccion.setId(1L);
        seleccion.setNombre("Colombia");

        when(seleccionRepository.findAll()).thenReturn(List.of(seleccion));

        List<PreferenciaDTO> resultado = service.obtenerCatalogoSelecciones();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Colombia", resultado.get(0).getNombre());
        verify(seleccionRepository).findAll();
    }
}