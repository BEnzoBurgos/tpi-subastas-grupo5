package com.subastas.subastas.dto.disputa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResolverDisputaRequestDTO {

    @NotBlank(message = "La resolución es obligatoria")
    private String resolucion;

    @NotBlank(message = "El estado final es obligatorio")
    @Pattern(regexp = "ADJUDICADA|FINALIZADA|CANCELADA",
             message = "El estado final debe ser ADJUDICADA, FINALIZADA o CANCELADA")
    private String estadoFinal;
}
