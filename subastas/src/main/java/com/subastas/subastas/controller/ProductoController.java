package com.subastas.subastas.controller;

import com.subastas.subastas.dto.producto.AsociarImagenRequestDTO;
import com.subastas.subastas.dto.producto.ProductoRequestDTO;
import com.subastas.subastas.dto.producto.ProductoResponseDTO;
import com.subastas.subastas.service.CloudinaryService;
import com.subastas.subastas.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listar() {
        return ResponseEntity.ok(productoService.listar());
    }

    @GetMapping("/mis-productos")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<ProductoResponseDTO>> misProductos(Principal principal) {
        return ResponseEntity.ok(productoService.listarMisProductos(principal.getName()));
    }

    // Sube el archivo a Cloudinary y devuelve la URL — no requiere productoId todavía
    @PostMapping(value = "/subir-imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Map<String, String>> subirImagen(
            @RequestParam("archivo") MultipartFile archivo) throws IOException {
        String url = cloudinaryService.subirImagen(archivo);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // Asocia una URL de Cloudinary ya subida con un producto y un orden
    @PostMapping("/imagen")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductoResponseDTO> asociarImagen(
            @Valid @RequestBody AsociarImagenRequestDTO request,
            Principal principal) {
        return ResponseEntity.ok(productoService.agregarImagen(request, principal.getName()));
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
