package com.subastas.subastas.service;

import com.subastas.subastas.dto.disputa.DisputaResponseDTO;
import com.subastas.subastas.dto.historial.HistorialActividadResponseDTO;
import com.subastas.subastas.dto.producto.ProductoResponseDTO;
import com.subastas.subastas.dto.puja.PujaResponseDTO;
import com.subastas.subastas.dto.subasta.SubastaResponseDTO;
import com.subastas.subastas.entity.Disputa;
import com.subastas.subastas.entity.Producto;
import com.subastas.subastas.entity.Puja;
import com.subastas.subastas.entity.Subasta;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.EstadoSubasta;
import com.subastas.subastas.repository.DisputaRepository;
import com.subastas.subastas.repository.ProductoRepository;
import com.subastas.subastas.repository.PujaRepository;
import com.subastas.subastas.repository.SubastaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialService {

    private final PujaRepository     pujaRepository;
    private final SubastaRepository  subastaRepository;
    private final ProductoRepository productoRepository;
    private final DisputaRepository  disputaRepository;

    public HistorialActividadResponseDTO construirHistorial(Usuario usuario) {

        List<Puja> misPujas = pujaRepository.findByUsuarioId(usuario.getId());

        List<PujaResponseDTO> pujasDTO = misPujas.stream()
                .map(this::pujaToResponse)
                .collect(Collectors.toList());

        List<SubastaResponseDTO> ganadas = subastaRepository.findByGanadorId(usuario.getId())
                .stream()
                .filter(s -> s.getEstado() == EstadoSubasta.ADJUDICADA)
                .map(this::subastaToResponse)
                .collect(Collectors.toList());

        Set<Long> subastaIdsConPujas = misPujas.stream()
                .map(p -> p.getSubasta().getId())
                .collect(Collectors.toSet());

        List<SubastaResponseDTO> perdidas = subastaIdsConPujas.stream()
                .map(id -> subastaRepository.findById(id))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .filter(s -> s.getEstado() == EstadoSubasta.ADJUDICADA
                          || s.getEstado() == EstadoSubasta.FINALIZADA)
                .filter(s -> s.getGanador() == null
                          || !s.getGanador().getId().equals(usuario.getId()))
                .map(this::subastaToResponse)
                .collect(Collectors.toList());

        boolean esSeller = usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SELLER"));

        List<ProductoResponseDTO> productos = esSeller
                ? productoRepository.findByVendedorId(usuario.getId()).stream()
                        .map(this::productoToResponse)
                        .collect(Collectors.toList())
                : List.of();

        List<DisputaResponseDTO> disputas = disputaRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(this::disputaToResponse)
                .collect(Collectors.toList());

        return new HistorialActividadResponseDTO(pujasDTO, ganadas, perdidas, productos, disputas);
    }

    private PujaResponseDTO pujaToResponse(Puja p) {
        return new PujaResponseDTO(
                p.getId(),
                p.getSubasta().getId(),
                p.getSubasta().getProducto().getNombre(),
                p.getUsuario().getId(),
                p.getUsuario().getNombre(),
                p.getUsuario().getApellido(),
                p.getMonto(),
                p.getFechaHora()
        );
    }

    private SubastaResponseDTO subastaToResponse(Subasta s) {
        long segundos = Math.max(0, ChronoUnit.SECONDS.between(LocalDateTime.now(), s.getFechaCierre()));
        return new SubastaResponseDTO(
                s.getId(),
                s.getProducto().getId(),
                s.getProducto().getNombre(),
                s.getVendedor().getId(),
                s.getVendedor().getNombre(),
                s.getVendedor().getApellido(),
                s.getGanador() != null ? s.getGanador().getId()       : null,
                s.getGanador() != null ? s.getGanador().getNombre()    : null,
                s.getGanador() != null ? s.getGanador().getApellido()  : null,
                s.getPrecioBase(),
                s.getIncrementoMinimo(),
                s.getMontoActual(),
                s.getFechaInicio(),
                s.getFechaCierre(),
                s.getDescripcion(),
                s.getEstado().name(),
                segundos
        );
    }

    private ProductoResponseDTO productoToResponse(Producto p) {
        return new ProductoResponseDTO(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getCategoria().getId(),
                p.getCategoria().getNombre(),
                p.getVendedor().getId(),
                p.getVendedor().getNombre(),
                p.getVendedor().getApellido()
        );
    }

    private DisputaResponseDTO disputaToResponse(Disputa d) {
        return new DisputaResponseDTO(
                d.getId(),
                d.getSubasta().getId(),
                d.getSubasta().getProducto().getNombre(),
                d.getUsuario().getId(),
                d.getUsuario().getNombre(),
                d.getUsuario().getApellido(),
                d.getMotivo(),
                d.getDescripcion(),
                d.getFechaApertura(),
                d.getResolucion(),
                d.getFechaResolucion()
        );
    }
}
