package com.subastas.subastas.dto.historial;

import com.subastas.subastas.dto.disputa.DisputaResponseDTO;
import com.subastas.subastas.dto.producto.ProductoResponseDTO;
import com.subastas.subastas.dto.puja.PujaResponseDTO;
import com.subastas.subastas.dto.subasta.SubastaResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class HistorialActividadResponseDTO {
    private List<PujaResponseDTO>     pujas;
    private List<SubastaResponseDTO>  subastasGanadas;
    private List<SubastaResponseDTO>  subastasPerdidas;
    private List<ProductoResponseDTO> productosPublicados;
    private List<DisputaResponseDTO>  disputasIniciadas;
}
