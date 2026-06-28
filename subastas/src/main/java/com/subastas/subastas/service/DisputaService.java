package com.subastas.subastas.service;

import com.subastas.subastas.dto.disputa.AbrirDisputaRequestDTO;
import com.subastas.subastas.dto.disputa.DisputaResponseDTO;
import com.subastas.subastas.dto.disputa.ResolverDisputaRequestDTO;
import com.subastas.subastas.entity.Disputa;
import com.subastas.subastas.entity.HistorialEstado;
import com.subastas.subastas.entity.Subasta;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.EstadoSubasta;
import com.subastas.subastas.repository.DisputaRepository;
import com.subastas.subastas.repository.HistorialEstadoRepository;
import com.subastas.subastas.repository.SubastaRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DisputaService {

    private final DisputaRepository disputaRepository;
    private final SubastaRepository subastaRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final NotificacionService notificacionService;

    @Transactional
    public DisputaResponseDTO abrir(Long subastaId, AbrirDisputaRequestDTO request, String emailUsuario) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));

        if (subasta.getEstado() != EstadoSubasta.ADJUDICADA) {
            throw new RuntimeException("Solo se puede abrir una disputa en subastas ADJUDICADAS");
        }

        if (disputaRepository.findBySubastaId(subastaId).isPresent()) {
            throw new RuntimeException("Ya existe una disputa para esta subasta");
        }

        Usuario usuario = buscarUsuario(emailUsuario);

        boolean esVendedor = subasta.getVendedor().getEmail().equals(emailUsuario);
        boolean esGanador = subasta.getGanador() != null && subasta.getGanador().getEmail().equals(emailUsuario);

        if (!esVendedor && !esGanador) {
            throw new RuntimeException("Solo el vendedor o el ganador pueden abrir una disputa");
        }

        Disputa disputa = Disputa.builder()
                .subasta(subasta)
                .usuario(usuario)
                .motivo(request.getMotivo())
                .descripcion(request.getDescripcion())
                .fechaApertura(LocalDateTime.now())
                .build();
        disputaRepository.save(disputa);

        historialEstadoRepository.save(HistorialEstado.builder()
                .subasta(subasta)
                .usuario(usuario)
                .estadoAnterior(EstadoSubasta.ADJUDICADA)
                .estadoNuevo(EstadoSubasta.EN_DISPUTA)
                .fecha(LocalDateTime.now())
                .motivo("Disputa abierta: " + request.getMotivo())
                .build());

        subasta.setEstado(EstadoSubasta.EN_DISPUTA);
        subastaRepository.save(subasta);

        if (esVendedor && subasta.getGanador() != null) {
            notificacionService.crearNotificacion(subasta.getGanador(), "DISPUTA_ABIERTA",
                    "El vendedor abrió una disputa sobre la subasta de " + subasta.getProducto().getNombre());
        } else if (esGanador) {
            notificacionService.crearNotificacion(subasta.getVendedor(), "DISPUTA_ABIERTA",
                    "El ganador abrió una disputa sobre la subasta de " + subasta.getProducto().getNombre());
        }

        return toResponse(disputa);
    }

    @Transactional
    public DisputaResponseDTO resolver(Long id, ResolverDisputaRequestDTO request) {
        Disputa disputa = disputaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disputa no encontrada"));

        if (disputa.getFechaResolucion() != null) {
            throw new RuntimeException("Esta disputa ya fue resuelta");
        }

        disputa.setResolucion(request.getResolucion());
        disputa.setFechaResolucion(LocalDateTime.now());
        disputaRepository.save(disputa);

        notificacionService.crearNotificacion(disputa.getUsuario(), "DISPUTA_RESUELTA",
                "Tu disputa sobre la subasta de " + disputa.getSubasta().getProducto().getNombre()
                + " fue resuelta: " + request.getResolucion());

        return toResponse(disputa);
    }

    public DisputaResponseDTO obtenerPorId(Long id) {
        return toResponse(disputaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disputa no encontrada")));
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    private DisputaResponseDTO toResponse(Disputa d) {
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
