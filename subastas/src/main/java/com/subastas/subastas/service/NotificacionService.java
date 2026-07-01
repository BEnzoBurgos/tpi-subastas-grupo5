package com.subastas.subastas.service;

import com.subastas.subastas.dto.notificacion.NotificacionResponseDTO;
import com.subastas.subastas.entity.Notificacion;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.repository.NotificacionRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository      usuarioRepository;
    private final EmailService           emailService;

    private static final Map<String, String> ASUNTOS = Map.of(
        "SUBASTA_GANADA",     "¡Ganaste una subasta! - TPI Subastas",
        "SUBASTA_ADJUDICADA", "Tu subasta fue adjudicada - TPI Subastas",
        "SUPERADO_EN_PUJA",   "Fuiste superado en una puja - TPI Subastas",
        "SUBASTA_CANCELADA",  "Una subasta fue cancelada - TPI Subastas",
        "DISPUTA_ABIERTA",    "Nueva disputa abierta - TPI Subastas",
        "DISPUTA_RESUELTA",   "Tu disputa fue resuelta - TPI Subastas"
    );

    public void crearNotificacion(Usuario usuario, String tipo, String mensaje) {
        Notificacion notificacion = Notificacion.builder()
                .usuario(usuario)
                .tipo(tipo)
                .mensaje(mensaje)
                .fecha(LocalDateTime.now())
                .build();
        notificacionRepository.save(notificacion);

        String asunto = ASUNTOS.get(tipo);
        if (asunto != null) {
            try {
                emailService.enviarEmail(usuario.getEmail(), asunto, mensaje);
            } catch (Exception e) {
                log.warn("No se pudo enviar email a {}: {}", usuario.getEmail(), e.getMessage());
            }
        }
    }

    public List<NotificacionResponseDTO> listarMisNotificaciones(String email) {
        Usuario usuario = buscarUsuario(email);
        return notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NotificacionResponseDTO marcarLeida(Long id, String email) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        if (!notificacion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tenés permiso para marcar esta notificación");
        }

        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
        return toResponse(notificacion);
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    private NotificacionResponseDTO toResponse(Notificacion n) {
        return new NotificacionResponseDTO(
                n.getId(),
                n.getTipo(),
                n.getMensaje(),
                n.getFecha(),
                n.isLeida()
        );
    }
}
