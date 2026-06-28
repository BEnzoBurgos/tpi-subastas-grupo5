package com.subastas.subastas.repository;

import com.subastas.subastas.entity.Subasta;
import com.subastas.subastas.enums.EstadoSubasta;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubastaRepository extends JpaRepository<Subasta, Long> {
    List<Subasta> findByEstado(EstadoSubasta estado);
    List<Subasta> findByVendedorId(Long vendedorId);
    List<Subasta> findByGanadorId(Long ganadorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Subasta s WHERE s.id = :id")
    Optional<Subasta> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT s FROM Subasta s WHERE s.estado = :estado AND s.fechaInicio <= :ahora")
    List<Subasta> findPublicadasParaActivar(@Param("estado") EstadoSubasta estado, @Param("ahora") LocalDateTime ahora);

    @Query("SELECT s FROM Subasta s WHERE s.estado = :estado AND s.fechaCierre <= :ahora")
    List<Subasta> findActivasParaFinalizar(@Param("estado") EstadoSubasta estado, @Param("ahora") LocalDateTime ahora);
}
