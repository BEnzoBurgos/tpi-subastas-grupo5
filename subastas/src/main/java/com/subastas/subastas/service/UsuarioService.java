package com.subastas.subastas.service;

import com.subastas.subastas.dto.usuario.UsuarioResponseDTO;
import com.subastas.subastas.entity.Rol;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.NombreRol;
import com.subastas.subastas.repository.RolRepository;
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
    private final RolRepository rolRepository;

    public UsuarioResponseDTO obtenerPerfil(String email) {
        return toResponse(buscarPorEmail(email));
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UsuarioResponseDTO asignarRol(Long id, NombreRol nombreRol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        usuario.getRoles().add(rol);
        usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    public UsuarioResponseDTO quitarRol(Long id, NombreRol nombreRol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        usuario.getRoles().remove(rol);
        usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    public UsuarioResponseDTO bloquear(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setBloqueado(true);
        usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    public UsuarioResponseDTO desbloquear(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setBloqueado(false);
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
