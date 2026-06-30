package com.subastas.subastas.controller;

import com.subastas.subastas.dto.usuario.UsuarioResponseDTO;
import com.subastas.subastas.enums.NombreRol;
import com.subastas.subastas.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/api/usuarios/me")
    public ResponseEntity<UsuarioResponseDTO> obtenerPerfil(Principal principal) {
        return ResponseEntity.ok(usuarioService.obtenerPerfil(principal.getName()));
    }

    @GetMapping("/api/admin/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PutMapping("/api/admin/usuarios/{id}/roles/{rol}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> asignarRol(@PathVariable Long id, @PathVariable NombreRol rol) {
        return ResponseEntity.ok(usuarioService.asignarRol(id, rol));
    }

    @DeleteMapping("/api/admin/usuarios/{id}/roles/{rol}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> quitarRol(@PathVariable Long id, @PathVariable NombreRol rol) {
        return ResponseEntity.ok(usuarioService.quitarRol(id, rol));
    }

    @PutMapping("/api/admin/usuarios/{id}/bloquear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> bloquear(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.bloquear(id));
    }

    @PutMapping("/api/admin/usuarios/{id}/desbloquear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> desbloquear(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.desbloquear(id));
    }
}
