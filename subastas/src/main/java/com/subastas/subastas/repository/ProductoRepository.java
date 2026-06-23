package com.subastas.subastas.repository;

import com.subastas.subastas.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByVendedorId(Long vendedorId);
    List<Producto> findByCategoriaId(Long categoriaId);
}
