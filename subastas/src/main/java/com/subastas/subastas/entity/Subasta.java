package com.subastas.subastas.entity;

import com.subastas.subastas.enums.EstadoSubasta;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Subasta")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @ManyToOne
    @JoinColumn(name = "ganador_id")
    private Usuario ganador;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal precioBase;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal incrementoMinimo;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montoActual;

    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    @Column(nullable = false)
    private LocalDateTime fechaCierre;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSubasta estado;

    @OneToMany(mappedBy = "subasta", cascade = CascadeType.ALL)
    private List<Puja> pujas;
}
