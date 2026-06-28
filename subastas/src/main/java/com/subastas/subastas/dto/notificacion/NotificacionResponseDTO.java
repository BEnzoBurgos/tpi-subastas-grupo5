package com.subastas.subastas.dto.notificacion;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificacionResponseDTO {
    private Long id;
    private String tipo;
    private String mensaje;
    private LocalDateTime fecha;
    private boolean leida;
}
