package com.subastas.subastas.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private LocalDate fechaNacimiento;
    private LocalDateTime fechaRegistro;
    private boolean bloqueado;
    private List<String> roles;
}
