package com.mediasquence.controller;

import com.mediasquence.dto.response.GenericResponseHandlers;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class RootController {

    @GetMapping
    public ResponseEntity<Object> healthEndpoint() {
        return new GenericResponseHandlers.Builder()
                .setStatus(HttpStatus.OK)
                .setMessage("Multi-Window Media Sequencer API is active and running")
                .setData(Map.of(
                        "status", "UP",
                        "windowsEndpoint", "/api/windows",
                        "playbackEndpoint", "/api/windows/playback",
                        "mediaEndpoint", "/api/media",
                        "syncEndpoint", "/api/sync"
                ))
                .create();
    }
}
