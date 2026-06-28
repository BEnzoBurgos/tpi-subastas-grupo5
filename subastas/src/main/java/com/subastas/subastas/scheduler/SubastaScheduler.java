package com.subastas.subastas.scheduler;

import com.subastas.subastas.service.SubastaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubastaScheduler {

    private final SubastaService subastaService;

    @Scheduled(fixedDelay = 60000)
    public void procesarSubastas() {
        log.info("Scheduler: procesando subastas...");
        try {
            subastaService.activarProgramadas();
        } catch (Exception e) {
            log.error("Scheduler: error al activar subastas", e);
        }
        try {
            subastaService.finalizarProgramadas();
        } catch (Exception e) {
            log.error("Scheduler: error al finalizar subastas", e);
        }
    }
}
