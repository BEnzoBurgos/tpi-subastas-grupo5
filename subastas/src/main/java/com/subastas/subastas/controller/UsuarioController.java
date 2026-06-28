package com.subastas.subastas.controller;

import com.subastas.subastas.dto.usuario.UsuarioResponseDTO;
import com.subastas.subastas.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/api/usuarios/me")
    public ResponseEntity<UsuarioResponseDTO> obtenerPerfil(Principal principal) {
        return ResponseEntity.ok(usuarioService.obtenerPerfil(principal.getName()));
    }

    @PutMapping("/api/admin/usuarios/{id}/bloquear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> bloquear(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.bloquear(id));
    }
}
