package com.subastas.subastas.controller;

import com.subastas.subastas.dto.puja.PujaRequestDTO;
import com.subastas.subastas.dto.puja.PujaResponseDTO;
import com.subastas.subastas.service.PujaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PujaController {

    private final PujaService pujaService;

    @PostMapping("/api/subastas/{id}/pujas")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PujaResponseDTO> registrarPuja(
            @PathVariable Long id,
            @Valid @RequestBody PujaRequestDTO request,
            Principal principal) {
        return ResponseEntity.ok(pujaService.registrarPuja(id, request, principal.getName()));
    }

    @GetMapping("/api/subastas/{id}/pujas")
    public ResponseEntity<List<PujaResponseDTO>> listarPorSubasta(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(pujaService.listarPorSubasta(id, principal.getName()));
    }

    @GetMapping("/api/pujas/mis-pujas")
    public ResponseEntity<List<PujaResponseDTO>> listarMisPujas(Principal principal) {
        return ResponseEntity.ok(pujaService.listarMisPujas(principal.getName()));
    }
}
