package co.edu.unbosque.mundial_2026.dto.request;

public class MetodoPagoRequestDTO {
    private Long usuarioId;
    private String type;
    private String label;
    private String details;

    public MetodoPagoRequestDTO() {
        //Constructor vacio
    }
public Long getUsuarioId() { return usuarioId; }
public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
  
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}