package com.subastas.subastas.entity;

import com.subastas.subastas.enums.EstadoSubasta;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "HistorialEstado")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialEstado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta_id", nullable = false)
    private Subasta subasta;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSubasta estadoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSubasta estadoNuevo;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(length = 500)
    private String motivo;
}
