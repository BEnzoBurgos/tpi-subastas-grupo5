package com.subastas.subastas.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequestDTO {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
