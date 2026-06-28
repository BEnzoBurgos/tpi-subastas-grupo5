package com.subastas.subastas.dto.producto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 255, message = "El nombre no puede superar 255 caracteres")
    private String nombre;

    private String descripcion;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;
}
