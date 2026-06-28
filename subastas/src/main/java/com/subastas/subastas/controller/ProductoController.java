package com.subastas.subastas.controller;

import com.subastas.subastas.dto.producto.ProductoRequestDTO;
import com.subastas.subastas.dto.producto.ProductoResponseDTO;
import com.subastas.subastas.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listar() {
        return ResponseEntity.ok(productoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductoResponseDTO> crear(
            @Valid @RequestBody ProductoRequestDTO request,
            Principal principal) {
        return ResponseEntity.ok(productoService.crear(request, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequestDTO request,
            Principal principal) {
        return ResponseEntity.ok(productoService.actualizar(id, request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Principal principal) {
        productoService.eliminar(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
