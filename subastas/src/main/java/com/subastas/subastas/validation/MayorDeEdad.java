package com.subastas.subastas.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MayorDeEdadValidator.class)
@Documented
public @interface MayorDeEdad {
    String message() default "El usuario debe ser mayor de 18 años";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
