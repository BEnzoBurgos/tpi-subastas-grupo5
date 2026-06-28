package com.subastas.subastas.service;

import com.subastas.subastas.dto.puja.PujaRequestDTO;
import com.subastas.subastas.dto.puja.PujaResponseDTO;
import com.subastas.subastas.entity.Puja;
import com.subastas.subastas.entity.Subasta;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.EstadoSubasta;
import com.subastas.subastas.repository.PujaRepository;
import com.subastas.subastas.repository.SubastaRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PujaService {

    private final PujaRepository pujaRepository;
    private final SubastaRepository subastaRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;

    @Transactional
    public PujaResponseDTO registrarPuja(Long subastaId, PujaRequestDTO request, String emailUsuario) {
        Subasta subasta = subastaRepository.findByIdWithLock(subastaId)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));

        if (subasta.getEstado() != EstadoSubasta.ACTIVA) {
            throw new RuntimeException("Solo se pueden registrar pujas en subastas ACTIVAS");
        }

        LocalDateTime ahora = LocalDateTime.now();
        if (!ahora.isBefore(subasta.getFechaCierre())) {
            throw new RuntimeException("La subasta ya ha cerrado");
        }

        Usuario usuario = buscarUsuario(emailUsuario);

        if (usuario.isBloqueado()) {
            throw new RuntimeException("Tu cuenta está bloqueada y no podés realizar pujas");
        }

        if (subasta.getVendedor().getEmail().equals(emailUsuario)) {
            throw new RuntimeException("El vendedor no puede pujar en su propia subasta");
        }

        BigDecimal monto = request.getMonto();
        Optional<Puja> topPuja = pujaRepository.findTopBySubastaIdOrderByMontoDesc(subastaId);

        if (topPuja.isEmpty()) {
            if (monto.compareTo(subasta.getPrecioBase()) < 0) {
                throw new RuntimeException(
                        "La primera puja debe ser mayor o igual al precio base: " + subasta.getPrecioBase());
            }
        } else {
            BigDecimal montoMinimo = subasta.getMontoActual().add(subasta.getIncrementoMinimo());
            if (monto.compareTo(montoMinimo) < 0) {
                throw new RuntimeException("El monto debe ser mayor o igual a " + montoMinimo);
            }
        }

        Puja puja = Puja.builder()
                .subasta(subasta)
                .usuario(usuario)
                .monto(monto)
                .fechaHora(ahora)
                .build();
        pujaRepository.save(puja);

        // Notificar al pujador anterior si es diferente al actual
        if (topPuja.isPresent() && !topPuja.get().getUsuario().getEmail().equals(emailUsuario)) {
            notificacionService.crearNotificacion(topPuja.get().getUsuario(), "SUPERADO_EN_PUJA",
                    "Fuiste superado en la subasta de " + subasta.getProducto().getNombre()
                    + ". Nuevo monto: " + monto);
        }

        subasta.setMontoActual(monto);
        subasta.setGanador(usuario);

        // Extensión automática: si quedan menos de 5 minutos, extender 5 minutos más
        if (ahora.isAfter(subasta.getFechaCierre().minusMinutes(5))) {
            subasta.setFechaCierre(subasta.getFechaCierre().plusMinutes(5));
        }

        subastaRepository.save(subasta);
        return toResponse(puja);
    }

    public List<PujaResponseDTO> listarPorSubasta(Long subastaId, String emailUsuario) {
        if (!subastaRepository.existsById(subastaId)) {
            throw new RuntimeException("Subasta no encontrada");
        }

        Usuario usuario = buscarUsuario(emailUsuario);
        List<Puja> pujas = pujaRepository.findBySubastaIdOrderByMontoDesc(subastaId);

        boolean esPrivilegiado = tieneRol(usuario, "SELLER") || tieneRol(usuario, "ADMIN");

        if (esPrivilegiado) {
            return pujas.stream().map(this::toResponse).collect(Collectors.toList());
        }

        return pujas.stream()
                .filter(p -> p.getUsuario().getEmail().equals(emailUsuario))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PujaResponseDTO> listarMisPujas(String emailUsuario) {
        Usuario usuario = buscarUsuario(emailUsuario);
        return pujaRepository.findByUsuarioId(usuario.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    private boolean tieneRol(Usuario usuario, String rol) {
        return usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + rol));
    }

    private PujaResponseDTO toResponse(Puja p) {
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
}
