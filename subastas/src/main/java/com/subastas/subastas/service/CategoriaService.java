package com.subastas.subastas.service;

import com.subastas.subastas.dto.categoria.CategoriaRequestDTO;
import com.subastas.subastas.dto.categoria.CategoriaResponseDTO;
import com.subastas.subastas.entity.Categoria;
import com.subastas.subastas.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<CategoriaResponseDTO> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(c -> new CategoriaResponseDTO(c.getId(), c.getNombre()))
                .collect(Collectors.toList());
    }

    public CategoriaResponseDTO crear(CategoriaRequestDTO request) {
        if (categoriaRepository.findByNombre(request.getNombre()).isPresent()) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }
        Categoria categoria = Categoria.builder()
                .nombre(request.getNombre())
                .build();
        categoriaRepository.save(categoria);
        return new CategoriaResponseDTO(categoria.getId(), categoria.getNombre());
    }

    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada");
        }
        categoriaRepository.deleteById(id);
    }
}
