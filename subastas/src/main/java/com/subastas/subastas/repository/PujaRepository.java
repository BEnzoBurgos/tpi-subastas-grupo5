package com.subastas.subastas.repository;

import com.subastas.subastas.entity.Puja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PujaRepository extends JpaRepository<Puja, Long> {
    List<Puja> findBySubastaIdOrderByMontoDesc(Long subastaId);
    List<Puja> findByUsuarioId(Long usuarioId);
    Optional<Puja> findTopBySubastaIdOrderByMontoDesc(Long subastaId);
}
