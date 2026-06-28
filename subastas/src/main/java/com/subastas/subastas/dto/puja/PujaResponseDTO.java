package com.subastas.subastas.dto.puja;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PujaResponseDTO {
    private Long id;
    private Long subastaId;
    private String subastaProductoNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioApellido;
    private BigDecimal monto;
    private LocalDateTime fechaHora;
}
