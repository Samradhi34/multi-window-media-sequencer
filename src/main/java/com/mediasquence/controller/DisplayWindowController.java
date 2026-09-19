package com.mediasquence.controller;

import com.mediasquence.dto.request.AddMediaRequest;
import com.mediasquence.dto.response.GenericResponseHandlers;
import com.mediasquence.dto.response.WindowPlaybackResponse;
import com.mediasquence.entity.DisplayWindow;
import com.mediasquence.service.DisplayWindowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/windows")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(originPatterns = "*")
public class DisplayWindowController {

	private final DisplayWindowService displayWindowService;

	@GetMapping
	public ResponseEntity<?> getAllWindows() {
		log.debug("REST request to fetch all display windows");
		List<DisplayWindow> windows = displayWindowService.getAllWindows();
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.OK)
				.setMessage("Windows retrieved successfully").setData(windows).create();
	}

	@PostMapping
	public ResponseEntity<?> createWindow(@Valid @RequestBody com.mediasquence.dto.request.CreateWindowRequest request) {
		log.info("REST request to create display window: '{}'", request.getName());
		DisplayWindow window = displayWindowService.createWindow(request);
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.CREATED)
				.setMessage("Display window created successfully").setData(window).create();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteWindow(@PathVariable("id") Long windowId) {
		log.info("REST request to delete display window ID: {}", windowId);
		displayWindowService.deleteWindow(windowId);
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.OK)
				.setMessage("Display window deleted successfully").create();
	}

	@GetMapping("/playback")
	public ResponseEntity<?> getAllWindowsPlaybackStatus() {
		log.debug("REST request to calculate playback status for all display windows");
		List<WindowPlaybackResponse> statuses = displayWindowService.getAllWindowsPlaybackStatus();
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.OK)
				.setMessage("All window playback statuses calculated successfully").setData(statuses).create();
	}

	@GetMapping("/{id}/playback")
	public ResponseEntity<?> getWindowPlaybackStatus(@PathVariable("id") Long windowId) {
		log.debug("REST request to calculate playback status for window ID: {}", windowId);
		WindowPlaybackResponse status = displayWindowService.getWindowPlaybackStatus(windowId);
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.OK)
				.setMessage("Window playback status calculated successfully").setData(status).create();
	}

	@PostMapping("/{id}/media")
	public ResponseEntity<?> addMediaToWindow(@PathVariable("id") Long windowId,
			@Valid @RequestBody AddMediaRequest request) {
		log.info("REST request to add media ID: {} to window ID: {}", request.getMediaId(), windowId);
		WindowPlaybackResponse updatedStatus = displayWindowService.addMediaToWindow(windowId, request);
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.OK)
				.setMessage("Media added to window playlist successfully").setData(updatedStatus).create();
	}

	@DeleteMapping("/{id}/media/{mediaId}")
	public ResponseEntity<?> removeMediaFromWindow(@PathVariable("id") Long windowId,
			@PathVariable("mediaId") Long mediaId) {
		log.info("REST request to remove media ID: {} from window ID: {}", mediaId, windowId);
		WindowPlaybackResponse updatedStatus = displayWindowService.removeMediaFromWindow(windowId, mediaId);
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.OK)
				.setMessage("Media removed from window playlist successfully").setData(updatedStatus).create();
	}

	@PostMapping("/{id}/media/{mediaId}/move")
	public ResponseEntity<?> movePlaylistItem(@PathVariable("id") Long windowId,
			@PathVariable("mediaId") Long mediaId,
			@RequestBody java.util.Map<String, String> payload) {
		String direction = payload.getOrDefault("direction", "up");
		log.info("REST request to move media ID: {} in window ID: {} {}", mediaId, windowId, direction);
		WindowPlaybackResponse updatedStatus = displayWindowService.movePlaylistItem(windowId, mediaId, direction);
		return new GenericResponseHandlers.Builder().setStatus(HttpStatus.OK)
				.setMessage("Playlist item reordered successfully").setData(updatedStatus).create();
	}
}
