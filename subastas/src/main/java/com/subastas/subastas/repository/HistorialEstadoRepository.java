package com.subastas.subastas.repository;

import com.subastas.subastas.entity.HistorialEstado;
import com.subastas.subastas.enums.EstadoSubasta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialEstadoRepository extends JpaRepository<HistorialEstado, Long> {
    List<HistorialEstado> findBySubastaIdOrderByFechaAsc(Long subastaId);
    List<HistorialEstado> findBySubastaIdAndEstadoNuevo(Long subastaId, EstadoSubasta estadoNuevo);
}
