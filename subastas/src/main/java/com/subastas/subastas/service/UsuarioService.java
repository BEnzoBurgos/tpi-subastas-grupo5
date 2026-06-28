package com.subastas.subastas.service;

import com.subastas.subastas.dto.usuario.UsuarioResponseDTO;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioResponseDTO obtenerPerfil(String email) {
        return toResponse(buscarPorEmail(email));
    }

    public UsuarioResponseDTO bloquear(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setBloqueado(true);
        usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    private Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    private UsuarioResponseDTO toResponse(Usuario u) {
        List<String> roles = u.getRoles().stream()
                .map(r -> r.getNombre().name())
                .collect(Collectors.toList());
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNombre(),
                u.getApellido(),
                u.getEmail(),
                u.getFechaNacimiento(),
                u.getFechaRegistro(),
                u.isBloqueado(),
                roles
        );
    }
}
