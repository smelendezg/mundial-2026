package co.edu.unbosque.mundial_2026.dto.response;

public class PreferenciaDTO {

    private Long id;
    private String nombre;

    public PreferenciaDTO(Long id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }
}