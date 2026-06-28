package com.subastas.subastas.dto.disputa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AbrirDisputaRequestDTO {

    @NotBlank(message = "El motivo es obligatorio")
    @Size(max = 255)
    private String motivo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;
}
