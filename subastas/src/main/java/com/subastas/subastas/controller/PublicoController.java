package com.subastas.subastas.controller;

import com.subastas.subastas.dto.subasta.SubastaResponseDTO;
import com.subastas.subastas.service.SubastaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publico")
@RequiredArgsConstructor
public class PublicoController {

    private final SubastaService subastaService;

    @GetMapping("/subastas")
    public ResponseEntity<List<SubastaResponseDTO>> listarPublicas() {
        return ResponseEntity.ok(subastaService.listarPublicas());
    }

    @GetMapping("/subastas/{id}")
    public ResponseEntity<SubastaResponseDTO> obtenerPublico(@PathVariable Long id) {
        return ResponseEntity.ok(subastaService.obtenerPublicoPorId(id));
    }
}
