package com.subastas.subastas.controller;

import com.subastas.subastas.dto.disputa.AbrirDisputaRequestDTO;
import com.subastas.subastas.dto.disputa.DisputaResponseDTO;
import com.subastas.subastas.dto.disputa.ResolverDisputaRequestDTO;
import com.subastas.subastas.service.DisputaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class DisputaController {

    private final DisputaService disputaService;

    @PostMapping("/api/subastas/{id}/disputas")
    @PreAuthorize("hasRole('SELLER') or hasRole('USER')")
    public ResponseEntity<DisputaResponseDTO> abrir(
            @PathVariable Long id,
            @Valid @RequestBody AbrirDisputaRequestDTO request,
            Principal principal) {
        return ResponseEntity.ok(disputaService.abrir(id, request, principal.getName()));
    }

    @PutMapping("/api/disputas/{id}/resolver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisputaResponseDTO> resolver(
            @PathVariable Long id,
            @Valid @RequestBody ResolverDisputaRequestDTO request) {
        return ResponseEntity.ok(disputaService.resolver(id, request));
    }

    @GetMapping("/api/disputas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisputaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(disputaService.obtenerPorId(id));
    }
}
