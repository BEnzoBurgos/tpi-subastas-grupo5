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
import java.util.List;

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

        EstadoSubasta estadoFinal = EstadoSubasta.valueOf(request.getEstadoFinal());

        LocalDateTime ahora = LocalDateTime.now();
        disputa.setResolucion(request.getResolucion());
        disputa.setFechaResolucion(ahora);
        disputaRepository.save(disputa);

        Subasta subasta = disputa.getSubasta();
        historialEstadoRepository.save(HistorialEstado.builder()
                .subasta(subasta)
                .usuario(null)
                .estadoAnterior(EstadoSubasta.EN_DISPUTA)
                .estadoNuevo(estadoFinal)
                .fecha(ahora)
                .motivo("Disputa resuelta: " + request.getResolucion())
                .build());

        subasta.setEstado(estadoFinal);
        subastaRepository.save(subasta);

        notificacionService.crearNotificacion(disputa.getUsuario(), "DISPUTA_RESUELTA",
                "Tu disputa sobre la subasta de " + subasta.getProducto().getNombre()
                + " fue resuelta. Estado final: " + estadoFinal.name()
                + ". " + request.getResolucion());

        return toResponse(disputa);
    }

    public List<DisputaResponseDTO> listarTodas() {
        return disputaRepository.findAll().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<DisputaResponseDTO> listarPendientes() {
        return disputaRepository.findByFechaResolucionIsNull().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public DisputaResponseDTO obtenerPorId(Long id, String emailUsuario) {
        Disputa disputa = disputaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disputa no encontrada"));

        Usuario usuario = buscarUsuario(emailUsuario);
        boolean esAdmin    = tieneRol(usuario, "ADMIN");
        boolean esAbridor  = disputa.getUsuario().getEmail().equals(emailUsuario);
        boolean esVendedor = disputa.getSubasta().getVendedor().getEmail().equals(emailUsuario);

        if (!esAdmin && !esAbridor && !esVendedor) {
            throw new RuntimeException("No tenés permiso para ver esta disputa");
        }

        return toResponse(disputa);
    }

    private boolean tieneRol(Usuario usuario, String rol) {
        return usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + rol));
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
