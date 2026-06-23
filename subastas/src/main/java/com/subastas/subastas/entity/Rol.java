package com.subastas.subastas.entity;

import com.subastas.subastas.enums.NombreRol;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Rol")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 20)
    private NombreRol nombre;
}
