package com.subastas.subastas.repository;

import com.subastas.subastas.entity.Disputa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DisputaRepository extends JpaRepository<Disputa, Long> {
    Optional<Disputa> findBySubastaId(Long subastaId);
    List<Disputa> findByUsuarioId(Long usuarioId);
    List<Disputa> findByFechaResolucionIsNull();
}
