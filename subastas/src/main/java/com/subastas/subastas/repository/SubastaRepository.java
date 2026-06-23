package com.subastas.subastas.repository;

import com.subastas.subastas.entity.Subasta;
import com.subastas.subastas.enums.EstadoSubasta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubastaRepository extends JpaRepository<Subasta, Long> {
    List<Subasta> findByEstado(EstadoSubasta estado);
    List<Subasta> findByVendedorId(Long vendedorId);
    List<Subasta> findByGanadorId(Long ganadorId);
}
