package com.subastas.subastas.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Disputa")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Disputa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta_id", nullable = false)
    private Subasta subasta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 255)
    private String motivo;

    @Column(nullable = false, columnDefinition = "VARCHAR(MAX)")
    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fechaApertura;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String resolucion;

    private LocalDateTime fechaResolucion;
}
