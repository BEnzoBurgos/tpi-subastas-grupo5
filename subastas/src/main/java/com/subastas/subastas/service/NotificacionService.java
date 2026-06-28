package com.subastas.subastas.service;

import com.subastas.subastas.dto.notificacion.NotificacionResponseDTO;
import com.subastas.subastas.entity.Notificacion;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.repository.NotificacionRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public void crearNotificacion(Usuario usuario, String tipo, String mensaje) {
        Notificacion notificacion = Notificacion.builder()
                .usuario(usuario)
                .tipo(tipo)
                .mensaje(mensaje)
                .fecha(LocalDateTime.now())
                .build();
        notificacionRepository.save(notificacion);
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
