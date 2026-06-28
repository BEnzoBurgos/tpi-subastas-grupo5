package com.subastas.subastas.controller;

import com.subastas.subastas.dto.notificacion.NotificacionResponseDTO;
import com.subastas.subastas.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/mis-notificaciones")
    public ResponseEntity<List<NotificacionResponseDTO>> listarMisNotificaciones(Principal principal) {
        return ResponseEntity.ok(notificacionService.listarMisNotificaciones(principal.getName()));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<NotificacionResponseDTO> marcarLeida(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(notificacionService.marcarLeida(id, principal.getName()));
    }
}
