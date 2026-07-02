package com.subastas.subastas.controller;

import com.subastas.subastas.dto.subasta.CancelacionRequestDTO;
import com.subastas.subastas.dto.subasta.SubastaRequestDTO;
import com.subastas.subastas.dto.subasta.SubastaResponseDTO;
import com.subastas.subastas.service.SubastaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/subastas")
@RequiredArgsConstructor
public class SubastaController {

    private final SubastaService subastaService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SubastaResponseDTO>> listar() {
        return ResponseEntity.ok(subastaService.listar());
    }

    @GetMapping("/mis-subastas")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<SubastaResponseDTO>> misSubastas(Principal principal) {
        return ResponseEntity.ok(subastaService.listarMisSubastas(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubastaResponseDTO> obtenerPorId(
            @PathVariable Long id,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(subastaService.obtenerPorId(id, email));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SubastaResponseDTO> crear(
            @Valid @RequestBody SubastaRequestDTO request,
            Principal principal) {
        return ResponseEntity.ok(subastaService.crear(request, principal.getName()));
    }

    @PutMapping("/{id}/publicar")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SubastaResponseDTO> publicar(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(subastaService.publicar(id, principal.getName()));
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) CancelacionRequestDTO request,
            Principal principal) {
        String motivo = request != null ? request.getMotivo() : null;
        subastaService.cancelar(id, principal.getName(), motivo);
        return ResponseEntity.noContent().build();
    }
}
