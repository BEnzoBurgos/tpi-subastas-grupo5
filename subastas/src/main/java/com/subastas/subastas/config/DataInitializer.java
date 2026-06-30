package com.subastas.subastas.config;

import com.subastas.subastas.entity.Categoria;
import com.subastas.subastas.entity.Rol;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.NombreRol;
import com.subastas.subastas.repository.CategoriaRepository;
import com.subastas.subastas.repository.RolRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final CategoriaRepository categoriaRepository;
    private final PasswordEncoder passwordEncoder;

    private static final List<String> CATEGORIAS_INICIALES = List.of(
        "Electronica",
        "Ropa y Accesorios",
        "Hogar y Muebles",
        "Arte y Antiguedades",
        "Vehiculos",
        "Deportes",
        "Libros y Coleccionables",
        "Joyas",
        "Instrumentos Musicales",
        "Otros"
    );

    @Override
    public void run(String... args) {
        inicializarCategorias();
        inicializarAdmin();
    }

    private void inicializarCategorias() {
        for (String nombre : CATEGORIAS_INICIALES) {
            if (categoriaRepository.findByNombre(nombre).isEmpty()) {
                categoriaRepository.save(Categoria.builder().nombre(nombre).build());
                log.info("Categoria creada: {}", nombre);
            }
        }
    }

    private void inicializarAdmin() {
        if (usuarioRepository.existsByEmail("admin@subastas.com")) {
            log.info("Usuario ADMIN ya existe, omitiendo inicializacion.");
            return;
        }

        Rol rolAdmin = rolRepository.findByNombre(NombreRol.ADMIN)
                .orElseThrow(() -> new IllegalStateException("Rol ADMIN no encontrado en la base de datos"));

        Usuario admin = Usuario.builder()
                .nombre("Admin")
                .apellido("Sistema")
                .email("admin@subastas.com")
                .password(passwordEncoder.encode("Admin123!"))
                .fechaNacimiento(LocalDate.of(1990, 1, 1))
                .fechaRegistro(LocalDateTime.now())
                .roles(Set.of(rolAdmin))
                .build();

        usuarioRepository.save(admin);
        log.info("Usuario ADMIN creado exitosamente: admin@subastas.com");
    }
}
