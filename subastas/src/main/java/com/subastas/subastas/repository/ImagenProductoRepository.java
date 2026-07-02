package com.subastas.subastas.repository;

import com.subastas.subastas.entity.ImagenProducto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {

    Optional<ImagenProducto> findByProductoIdAndOrden(Long productoId, Integer orden);

    long countByProductoId(Long productoId);
}
