package com.subastas.subastas.service;

import com.subastas.subastas.dto.auth.AuthResponseDTO;
import com.subastas.subastas.dto.auth.LoginRequestDTO;
import com.subastas.subastas.dto.auth.RegisterRequestDTO;
import com.subastas.subastas.entity.Rol;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.NombreRol;
import com.subastas.subastas.repository.RolRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import com.subastas.subastas.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Rol rolUser = rolRepository.findByNombre(NombreRol.USER)
                .orElseThrow(() -> new RuntimeException("Rol USER no encontrado en la base de datos"));

        Set<Rol> roles = new HashSet<>();
        roles.add(rolUser);

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fechaNacimiento(request.getFechaNacimiento())
                .fechaRegistro(LocalDateTime.now())
                .roles(roles)
                .build();

        usuarioRepository.save(usuario);

        String token = jwtUtil.generateToken(usuario);
        return new AuthResponseDTO(token, usuario.getEmail(), usuario.getNombre());
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String token = jwtUtil.generateToken(usuario);
        return new AuthResponseDTO(token, usuario.getEmail(), usuario.getNombre());
    }
}
