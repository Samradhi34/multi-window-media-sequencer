package com.mediasquence.controller;

import com.mediasquence.dto.request.SyncTriggerRequest;
import com.mediasquence.dto.response.GenericResponseHandlers;
import com.mediasquence.dto.response.SyncStatusResponse;
import com.mediasquence.service.SyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class SyncController {

    private final SyncService syncService;

    @GetMapping
    public ResponseEntity<?> getSyncStatus() {
        log.debug("REST request to fetch global sync status");
        SyncStatusResponse status = syncService.getCurrentSyncStatus();
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Sync status retrieved successfully")
                .setData(status)
                .create();
    }

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerSync(@Valid @RequestBody SyncTriggerRequest request) {
        log.info("REST request to trigger global sync. Media ID: {}, Duration: {}s",
                request.getMediaId(), request.getDurationSeconds());
        SyncStatusResponse status = syncService.triggerSync(request);
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Global sync triggered across all windows")
                .setData(status)
                .create();
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSync() {
        log.info("REST request to cancel active global sync");
        syncService.cancelSync();
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Global sync cancelled successfully")
                .create();
    }
}
