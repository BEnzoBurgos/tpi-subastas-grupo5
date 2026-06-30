package com.subastas.subastas.dto.subasta;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SubastaResponseDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private Long vendedorId;
    private String vendedorNombre;
    private String vendedorApellido;
    private Long ganadorId;
    private String ganadorNombre;
    private String ganadorApellido;
    private BigDecimal precioBase;
    private BigDecimal incrementoMinimo;
    private BigDecimal montoActual;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaCierre;
    private String descripcion;
    private String estado;
    private long tiempoRestanteSegundos;
}
