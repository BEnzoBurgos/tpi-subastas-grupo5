package com.subastas.subastas.service;

import com.subastas.subastas.dto.subasta.CancelacionRequestDTO;
import com.subastas.subastas.dto.subasta.SubastaRequestDTO;
import com.subastas.subastas.dto.subasta.SubastaResponseDTO;
import com.subastas.subastas.entity.HistorialEstado;
import com.subastas.subastas.entity.Producto;
import com.subastas.subastas.entity.Puja;
import com.subastas.subastas.entity.Subasta;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.EstadoSubasta;
import com.subastas.subastas.repository.HistorialEstadoRepository;
import com.subastas.subastas.repository.ProductoRepository;
import com.subastas.subastas.repository.PujaRepository;
import com.subastas.subastas.repository.SubastaRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PujaRepository pujaRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final NotificacionService notificacionService;

    public SubastaResponseDTO crear(SubastaRequestDTO request, String emailVendedor) {
        if (request.getFechaInicio().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("La fecha de inicio no puede ser anterior a la fecha actual");
        }
        if (!request.getFechaCierre().isAfter(request.getFechaInicio())) {
            throw new RuntimeException("La fecha de cierre debe ser posterior a la fecha de inicio");
        }

        Usuario vendedor = buscarUsuario(emailVendedor);

        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Subasta subasta = Subasta.builder()
                .producto(producto)
                .vendedor(vendedor)
                .precioBase(request.getPrecioBase())
                .incrementoMinimo(request.getIncrementoMinimo())
                .montoActual(request.getPrecioBase())
                .fechaInicio(request.getFechaInicio())
                .fechaCierre(request.getFechaCierre())
                .descripcion(request.getDescripcion())
                .estado(EstadoSubasta.BORRADOR)
                .build();

        subastaRepository.save(subasta);
        return toResponse(subasta);
    }

    public SubastaResponseDTO publicar(Long id, String emailUsuario) {
        Subasta subasta = buscarSubasta(id);
        verificarPropietario(subasta, emailUsuario);

        if (subasta.getEstado() != EstadoSubasta.BORRADOR) {
            throw new RuntimeException("Solo se puede publicar una subasta en estado BORRADOR");
        }

        Usuario usuario = buscarUsuario(emailUsuario);
        cambiarEstado(subasta, EstadoSubasta.PUBLICADA, usuario, "Subasta publicada");
        return toResponse(subasta);
    }

    public SubastaResponseDTO activar(Long id, String emailUsuario) {
        Subasta subasta = buscarSubasta(id);

        if (subasta.getEstado() != EstadoSubasta.PUBLICADA) {
            throw new RuntimeException("Solo se puede activar una subasta en estado PUBLICADA");
        }

        Usuario usuario = buscarUsuario(emailUsuario);
        cambiarEstado(subasta, EstadoSubasta.ACTIVA, usuario, "Subasta activada");
        return toResponse(subasta);
    }

    public SubastaResponseDTO finalizar(Long id, String emailUsuario) {
        Subasta subasta = buscarSubasta(id);

        if (subasta.getEstado() != EstadoSubasta.ACTIVA) {
            throw new RuntimeException("Solo se puede finalizar una subasta en estado ACTIVA");
        }

        Usuario usuario = buscarUsuario(emailUsuario);
        return finalizarSubasta(subasta, usuario);
    }

    public void cancelar(Long id, String emailUsuario, String motivo) {
        Subasta subasta = buscarSubasta(id);
        Usuario usuario = buscarUsuario(emailUsuario);

        EstadoSubasta estadoActual = subasta.getEstado();
        if (estadoActual == EstadoSubasta.FINALIZADA ||
                estadoActual == EstadoSubasta.CANCELADA ||
                estadoActual == EstadoSubasta.ADJUDICADA) {
            throw new RuntimeException("No se puede cancelar una subasta en estado " + estadoActual);
        }

        boolean esAdmin = tieneRol(usuario, "ADMIN");

        if (!esAdmin) {
            verificarPropietario(subasta, emailUsuario);
            List<Puja> pujas = pujaRepository.findBySubastaIdOrderByMontoDesc(subasta.getId());
            if (!pujas.isEmpty()) {
                throw new RuntimeException("No podés cancelar una subasta que tiene pujas activas");
            }
        }

        cambiarEstado(subasta, EstadoSubasta.CANCELADA, usuario,
                motivo != null ? motivo : "Subasta cancelada");

        // Notificar a todos los pujadores únicos
        List<Puja> pujas = pujaRepository.findBySubastaIdOrderByMontoDesc(subasta.getId());
        Set<Long> notificados = new HashSet<>();
        for (Puja p : pujas) {
            if (notificados.add(p.getUsuario().getId())) {
                notificacionService.crearNotificacion(p.getUsuario(), "SUBASTA_CANCELADA",
                        "La subasta de " + subasta.getProducto().getNombre() + " fue cancelada");
            }
        }
    }

    public List<SubastaResponseDTO> listar() {
        return subastaRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SubastaResponseDTO> listarPublicas() {
        return Stream.concat(
                subastaRepository.findByEstado(EstadoSubasta.ACTIVA).stream(),
                subastaRepository.findByEstado(EstadoSubasta.PUBLICADA).stream()
        ).map(this::toResponse).collect(Collectors.toList());
    }

    public SubastaResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarSubasta(id));
    }

    public SubastaResponseDTO obtenerPublicoPorId(Long id) {
        Subasta subasta = buscarSubasta(id);
        if (subasta.getEstado() != EstadoSubasta.ACTIVA &&
            subasta.getEstado() != EstadoSubasta.PUBLICADA &&
            subasta.getEstado() != EstadoSubasta.ADJUDICADA &&
            subasta.getEstado() != EstadoSubasta.FINALIZADA) {
            throw new RuntimeException("Subasta no disponible");
        }
        return toResponse(subasta);
    }

    // ── Métodos para el Scheduler ─────────────────────────────────────────────

    @Transactional
    public void activarProgramadas() {
        List<Subasta> publicadas = subastaRepository.findPublicadasParaActivar(
                EstadoSubasta.PUBLICADA, LocalDateTime.now());
        for (Subasta subasta : publicadas) {
            cambiarEstado(subasta, EstadoSubasta.ACTIVA, null, "Activación automática");
        }
    }

    @Transactional
    public void finalizarProgramadas() {
        List<Subasta> activas = subastaRepository.findActivasParaFinalizar(
                EstadoSubasta.ACTIVA, LocalDateTime.now());
        for (Subasta subasta : activas) {
            finalizarSubasta(subasta, null);
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private SubastaResponseDTO finalizarSubasta(Subasta subasta, Usuario responsable) {
        List<Puja> pujas = pujaRepository.findBySubastaIdOrderByMontoDesc(subasta.getId());

        EstadoSubasta estadoFinal;
        if (pujas.isEmpty()) {
            estadoFinal = EstadoSubasta.FINALIZADA;
        } else {
            estadoFinal = EstadoSubasta.ADJUDICADA;
            Puja ganadora = pujas.get(0);
            subasta.setGanador(ganadora.getUsuario());
            subasta.setMontoActual(ganadora.getMonto());

            notificacionService.crearNotificacion(ganadora.getUsuario(), "SUBASTA_GANADA",
                    "¡Ganaste la subasta de " + subasta.getProducto().getNombre()
                    + "! Monto final: " + ganadora.getMonto());
            notificacionService.crearNotificacion(subasta.getVendedor(), "SUBASTA_ADJUDICADA",
                    "Tu subasta de " + subasta.getProducto().getNombre()
                    + " fue adjudicada a " + ganadora.getUsuario().getNombre()
                    + " " + ganadora.getUsuario().getApellido()
                    + " por " + ganadora.getMonto());
        }

        cambiarEstado(subasta, estadoFinal, responsable, "Finalización automática");
        return toResponse(subasta);
    }

    private void cambiarEstado(Subasta subasta, EstadoSubasta estadoNuevo,
                               Usuario usuario, String motivo) {
        HistorialEstado historial = HistorialEstado.builder()
                .subasta(subasta)
                .usuario(usuario)
                .estadoAnterior(subasta.getEstado())
                .estadoNuevo(estadoNuevo)
                .fecha(LocalDateTime.now())
                .motivo(motivo)
                .build();

        subasta.setEstado(estadoNuevo);
        subastaRepository.save(subasta);
        historialEstadoRepository.save(historial);
    }

    private Subasta buscarSubasta(Long id) {
        return subastaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    private void verificarPropietario(Subasta subasta, String email) {
        if (!subasta.getVendedor().getEmail().equals(email)) {
            throw new RuntimeException("No tenés permiso para modificar esta subasta");
        }
    }

    private boolean tieneRol(Usuario usuario, String rol) {
        return usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + rol));
    }

    private SubastaResponseDTO toResponse(Subasta s) {
        long segundosRestantes = Math.max(0, ChronoUnit.SECONDS.between(LocalDateTime.now(), s.getFechaCierre()));
        return new SubastaResponseDTO(
                s.getId(),
                s.getProducto().getId(),
                s.getProducto().getNombre(),
                s.getVendedor().getId(),
                s.getVendedor().getNombre(),
                s.getVendedor().getApellido(),
                s.getGanador() != null ? s.getGanador().getId() : null,
                s.getGanador() != null ? s.getGanador().getNombre() : null,
                s.getGanador() != null ? s.getGanador().getApellido() : null,
                s.getPrecioBase(),
                s.getIncrementoMinimo(),
                s.getMontoActual(),
                s.getFechaInicio(),
                s.getFechaCierre(),
                s.getDescripcion(),
                s.getEstado().name(),
                segundosRestantes
        );
    }
}
