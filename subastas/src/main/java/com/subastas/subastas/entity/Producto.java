package com.subastas.subastas.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Producto")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String descripcion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    @Builder.Default
    private List<ImagenProducto> imagenes = new ArrayList<>();
}
