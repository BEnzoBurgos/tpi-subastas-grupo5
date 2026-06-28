package com.subastas.subastas.dto.disputa;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResolverDisputaRequestDTO {

    @NotBlank(message = "La resolución es obligatoria")
    private String resolucion;
}
