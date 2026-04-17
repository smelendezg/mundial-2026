package co.edu.unbosque.mundial_2026.dto.request;

import jakarta.validation.constraints.Email;

public class UsuarioActualizarRequestDTO {

    private String nombre;
    private String apellido;
    @Email(message = "El correo nuevo no es válido")
    private String correoNuevo;
    private String contrasenaActual;
    private String contrasenaNueva;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCorreoNuevo() {
        return correoNuevo;
    }

    public void setCorreoNuevo(String correoNuevo) {
        this.correoNuevo = correoNuevo;
    }

    public String getContrasenaActual() {
        return contrasenaActual;
    }

    public void setContrasenaActual(String contrasenaActual) {
        this.contrasenaActual = contrasenaActual;
    }

    public String getContrasenaNueva() {
        return contrasenaNueva;
    }

    public void setContrasenaNueva(String contrasenaNueva) {
        this.contrasenaNueva = contrasenaNueva;
    }
}