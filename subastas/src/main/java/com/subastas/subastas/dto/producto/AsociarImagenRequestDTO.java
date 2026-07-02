package com.subastas.subastas.dto.producto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AsociarImagenRequestDTO {

    @NotNull(message = "El id del producto es obligatorio")
    private Long productoId;

    @NotBlank(message = "La URL de la imagen es obligatoria")
    private String url;

    @NotNull(message = "El orden es obligatorio")
    @Min(value = 1, message = "El orden debe ser 1, 2 o 3")
    @Max(value = 3, message = "El orden debe ser 1, 2 o 3")
    private Integer orden;
}
