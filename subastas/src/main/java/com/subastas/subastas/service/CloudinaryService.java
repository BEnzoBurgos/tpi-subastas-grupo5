package com.subastas.subastas.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String subirImagen(MultipartFile archivo) throws IOException {
        Map<?, ?> resultado = cloudinary.uploader().upload(
                archivo.getBytes(),
                ObjectUtils.asMap("folder", "subastas", "resource_type", "auto")
        );
        return (String) resultado.get("secure_url");
    }
}
