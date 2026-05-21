package co.edu.unbosque.mundial_2026;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import co.edu.unbosque.mundial_2026.dto.request.MetodoPagoRequestDTO;
import co.edu.unbosque.mundial_2026.dto.response.MetodoPagoResponseDTO;
import co.edu.unbosque.mundial_2026.entity.MetodoPago;
import co.edu.unbosque.mundial_2026.entity.Rol;
import co.edu.unbosque.mundial_2026.entity.Usuario;
import co.edu.unbosque.mundial_2026.exception.MetodoPagoNotFoundException;
import co.edu.unbosque.mundial_2026.repository.MetodoPagoRepository;
import co.edu.unbosque.mundial_2026.service.MetodoPagoServiceImpl;
import co.edu.unbosque.mundial_2026.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
class MetodoPagoServiceImplTest {

    @Mock private MetodoPagoRepository metodoPagoRepository;
    @Mock private UsuarioService usuarioService;

    @InjectMocks private MetodoPagoServiceImpl service;

    private Usuario crearUsuario(Long id) {
        Rol rol = new Rol();
        rol.setNombre("ROLE_USUARIO");
        Usuario u = new Usuario();
        u.setId(id);
        u.setCorreoUsuario("user@test.com");
        u.setRol(rol);
        return u;
    }

    private MetodoPago crearMetodoPago(Long id, Usuario usuario, boolean isDefault) {
        MetodoPago m = new MetodoPago();
        m.setId(id);
        m.setUsuario(usuario);
        m.setTipo("CARD");
        m.setLabel("Visa *4242");
        m.setDetails("pm_test_123");
        m.setDefault(isDefault);
        m.setCreatedAt("2026-01-01T00:00:00");
        return m;
    }

    @Test
    void agregar_primerMetodo_esDefault() {
        Usuario usuario = crearUsuario(1L);
        MetodoPago metodo = crearMetodoPago(1L, usuario, true);

        MetodoPagoRequestDTO dto = new MetodoPagoRequestDTO();
        dto.setUsuarioId(1L);
        dto.setType("CARD");
        dto.setLabel("Visa *4242");
        dto.setDetails("pm_test_123");

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(metodoPagoRepository.findByUsuarioId(1L)).thenReturn(List.of());
        when(metodoPagoRepository.save(any(MetodoPago.class))).thenReturn(metodo);

        MetodoPagoResponseDTO resultado = service.agregar(dto);

        assertNotNull(resultado);
        verify(metodoPagoRepository).save(any(MetodoPago.class));
    }

    @Test
    void agregar_segundoMetodo_noEsDefault() {
        Usuario usuario = crearUsuario(1L);
        MetodoPago existente = crearMetodoPago(1L, usuario, true);
        MetodoPago nuevo = crearMetodoPago(2L, usuario, false);

        MetodoPagoRequestDTO dto = new MetodoPagoRequestDTO();
        dto.setUsuarioId(1L);
        dto.setType("CARD");
        dto.setLabel("Mastercard *1234");
        dto.setDetails("pm_test_456");

        when(usuarioService.obtenerEntidadPorId(1L)).thenReturn(usuario);
        when(metodoPagoRepository.findByUsuarioId(1L)).thenReturn(List.of(existente));
        when(metodoPagoRepository.save(any(MetodoPago.class))).thenReturn(nuevo);

        MetodoPagoResponseDTO resultado = service.agregar(dto);

        assertNotNull(resultado);
    }

    @Test
    void listarPorUsuario_conMetodos_retornaLista() {
        Usuario usuario = crearUsuario(1L);
        MetodoPago metodo = crearMetodoPago(1L, usuario, true);

        when(metodoPagoRepository.findByUsuarioIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(metodo));

        List<MetodoPagoResponseDTO> resultado = service.listarPorUsuario(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void listarPorUsuario_sinMetodos_retornaVacio() {
        when(metodoPagoRepository.findByUsuarioIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        List<MetodoPagoResponseDTO> resultado = service.listarPorUsuario(1L);

        assertNotNull(resultado);
        assertTrue(resultado.isEmpty());
    }

    @Test
    void setDefault_metodoExistente_cambiaDefault() {
        Usuario usuario = crearUsuario(1L);
        MetodoPago metodo1 = crearMetodoPago(1L, usuario, true);
        MetodoPago metodo2 = crearMetodoPago(2L, usuario, false);

        when(metodoPagoRepository.findByUsuarioId(1L)).thenReturn(List.of(metodo1, metodo2));
        when(metodoPagoRepository.saveAll(any())).thenReturn(List.of(metodo1, metodo2));

        boolean resultado = service.setDefault(1L, 2L);

        assertTrue(resultado);
        assertTrue(metodo2.isDefault());
        assertFalse(metodo1.isDefault());
    }

    @Test
    void setDefault_metodoNoExistente_lanzaExcepcion() {
        Usuario usuario = crearUsuario(1L);
        MetodoPago metodo = crearMetodoPago(1L, usuario, true);

        when(metodoPagoRepository.findByUsuarioId(1L)).thenReturn(List.of(metodo));

        assertThrows(MetodoPagoNotFoundException.class,
                () -> service.setDefault(1L, 99L));
    }

    @Test
    void obtenerEntidadPorId_existente_retornaEntidad() {
        Usuario usuario = crearUsuario(1L);
        MetodoPago metodo = crearMetodoPago(1L, usuario, true);

        when(metodoPagoRepository.findById(1L)).thenReturn(Optional.of(metodo));

        MetodoPago resultado = service.obtenerEntidadPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
    }

    @Test
    void obtenerEntidadPorId_noExistente_lanzaExcepcion() {
        when(metodoPagoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(MetodoPagoNotFoundException.class,
                () -> service.obtenerEntidadPorId(99L));
    }
}
