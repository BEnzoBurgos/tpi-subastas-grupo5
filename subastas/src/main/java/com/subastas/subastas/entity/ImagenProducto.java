package com.subastas.subastas.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ImagenProducto")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImagenProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(nullable = false)
    private Integer orden;
}
