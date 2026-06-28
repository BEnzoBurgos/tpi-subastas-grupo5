package com.subastas.subastas.dto.disputa;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DisputaResponseDTO {
    private Long id;
    private Long subastaId;
    private String subastaProductoNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioApellido;
    private String motivo;
    private String descripcion;
    private LocalDateTime fechaApertura;
    private String resolucion;
    private LocalDateTime fechaResolucion;
}
