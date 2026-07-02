package com.subastas.subastas.service;

import com.subastas.subastas.dto.producto.AsociarImagenRequestDTO;
import com.subastas.subastas.dto.producto.ProductoRequestDTO;
import com.subastas.subastas.dto.producto.ProductoResponseDTO;
import com.subastas.subastas.entity.Categoria;
import com.subastas.subastas.entity.ImagenProducto;
import com.subastas.subastas.entity.Producto;
import com.subastas.subastas.entity.Usuario;
import com.subastas.subastas.enums.EstadoSubasta;
import com.subastas.subastas.repository.CategoriaRepository;
import com.subastas.subastas.repository.ImagenProductoRepository;
import com.subastas.subastas.repository.ProductoRepository;
import com.subastas.subastas.repository.SubastaRepository;
import com.subastas.subastas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SubastaRepository subastaRepository;
    private final ImagenProductoRepository imagenProductoRepository;

    public List<ProductoResponseDTO> listar() {
        return productoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductoResponseDTO> listarMisProductos(String emailVendedor) {
        Usuario vendedor = usuarioRepository.findByEmail(emailVendedor)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return productoRepository.findByVendedorId(vendedor.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductoResponseDTO obtenerPorId(Long id) {
        return toResponse(buscarProducto(id));
    }

    public ProductoResponseDTO crear(ProductoRequestDTO request, String emailVendedor) {
        Usuario vendedor = usuarioRepository.findByEmail(emailVendedor)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Producto producto = Producto.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .categoria(categoria)
                .vendedor(vendedor)
                .build();

        productoRepository.save(producto);
        return toResponse(producto);
    }

    private static final List<EstadoSubasta> ESTADOS_LIBRES =
            List.of(EstadoSubasta.BORRADOR, EstadoSubasta.CANCELADA);

    public ProductoResponseDTO actualizar(Long id, ProductoRequestDTO request, String emailVendedor) {
        Producto producto = buscarProducto(id);
        verificarPropietario(producto, emailVendedor);

        if (subastaRepository.existsByProductoIdAndEstadoNotIn(id, ESTADOS_LIBRES)) {
            throw new RuntimeException(
                "No se puede editar el producto \"" + producto.getNombre() +
                "\" porque ya esta publicado en una subasta activa."
            );
        }

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setCategoria(categoria);

        productoRepository.save(producto);
        return toResponse(producto);
    }

    @Transactional
    public ProductoResponseDTO agregarImagen(AsociarImagenRequestDTO request, String emailVendedor) {
        Producto producto = buscarProducto(request.getProductoId());
        verificarPropietario(producto, emailVendedor);

        // Reemplazar si ya existe imagen en este slot
        imagenProductoRepository.findByProductoIdAndOrden(request.getProductoId(), request.getOrden())
                .ifPresent(imagenProductoRepository::delete);

        imagenProductoRepository.flush();

        long total = imagenProductoRepository.countByProductoId(request.getProductoId());
        if (total >= 3) {
            throw new RuntimeException("El producto ya tiene el máximo de 3 imágenes");
        }

        ImagenProducto imagen = ImagenProducto.builder()
                .producto(producto)
                .url(request.getUrl())
                .orden(request.getOrden())
                .build();
        imagenProductoRepository.save(imagen);

        return toResponse(productoRepository.findById(request.getProductoId()).orElseThrow());
    }

    public void eliminar(Long id, String emailUsuario) {
        Producto producto = buscarProducto(id);
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        boolean esAdmin = usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!esAdmin) {
            verificarPropietario(producto, emailUsuario);
        }

        if (subastaRepository.existsByProductoId(id)) {
            throw new RuntimeException(
                "No se puede eliminar el producto \"" + producto.getNombre() +
                "\" porque ya fue utilizado en una o mas subastas."
            );
        }

        productoRepository.deleteById(id);
    }

    private Producto buscarProducto(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    private void verificarPropietario(Producto producto, String email) {
        if (!producto.getVendedor().getEmail().equals(email)) {
            throw new RuntimeException("No tenés permiso para modificar este producto");
        }
    }

    private ProductoResponseDTO toResponse(Producto p) {
        boolean bloqueado = subastaRepository.existsByProductoIdAndEstadoNotIn(p.getId(), ESTADOS_LIBRES);
        List<String> imagenesUrl = p.getImagenes().stream()
                .map(ImagenProducto::getUrl)
                .collect(Collectors.toList());
        return new ProductoResponseDTO(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getCategoria().getId(),
                p.getCategoria().getNombre(),
                p.getVendedor().getId(),
                p.getVendedor().getNombre(),
                p.getVendedor().getApellido(),
                bloqueado,
                imagenesUrl
        );
    }
}
