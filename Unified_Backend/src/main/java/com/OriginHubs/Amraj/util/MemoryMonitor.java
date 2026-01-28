package com.OriginHubs.Amraj.util;

import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;

@Slf4j
@Component
public class MemoryMonitor {

    private final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();

    public void logMemoryUsage(String context) {
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsage = memoryBean.getNonHeapMemoryUsage();
        
        log.info("Memory Usage [{}] - Heap: {}/{} MB, Non-Heap: {}/{} MB", 
            context,
            heapUsage.getUsed() / 1024 / 1024,
            heapUsage.getMax() / 1024 / 1024,
            nonHeapUsage.getUsed() / 1024 / 1024,
            nonHeapUsage.getMax() / 1024 / 1024
        );
    }

    public boolean isMemoryPressure() {
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        double usageRatio = (double) heapUsage.getUsed() / heapUsage.getMax();
        return usageRatio > 0.8; // 80% threshold
    }

    public void forceGC() {
        if (isMemoryPressure()) {
            log.warn("High memory usage detected, suggesting GC");
            System.gc();
        }
    }
}