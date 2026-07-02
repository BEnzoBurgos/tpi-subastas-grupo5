package com.subastas.subastas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        String mensajeResumen = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getDefaultMessage())
            .collect(Collectors.joining(". "));

        Map<String, Object> body = new HashMap<>();
        body.put("message", mensajeResumen);
        body.put("errors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "Formato de datos inválido. Verificá que las fechas y campos enviados sean correctos"));
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Map<String, String>> handleLockedException(LockedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("message",
                "Tu cuenta está bloqueada. Para más información contactá a subastasonline@gmail.com"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "Error interno del servidor"));
    }
}
