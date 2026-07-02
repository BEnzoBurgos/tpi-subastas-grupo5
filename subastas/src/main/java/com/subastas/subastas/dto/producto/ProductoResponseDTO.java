package com.subastas.subastas.dto.producto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ProductoResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Long categoriaId;
    private String categoriaNombre;
    private Long vendedorId;
    private String vendedorNombre;
    private String vendedorApellido;
    private boolean bloqueado;
    private List<String> imagenesUrl;
}
