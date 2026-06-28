package com.subastas.subastas.dto.subasta;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SubastaRequestDTO {

    @NotNull(message = "El producto es obligatorio")
    private Long productoId;

    @NotNull(message = "El precio base es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio base debe ser mayor a 0")
    private BigDecimal precioBase;

    @NotNull(message = "El incremento mínimo es obligatorio")
    @DecimalMin(value = "0.01", message = "El incremento mínimo debe ser mayor a 0")
    private BigDecimal incrementoMinimo;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha de cierre es obligatoria")
    private LocalDateTime fechaCierre;

    private String descripcion;
}
