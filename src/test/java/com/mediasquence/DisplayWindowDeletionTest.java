package com.mediasquence;

import com.mediasquence.constants.MediaType;
import com.mediasquence.entity.DisplayWindow;
import com.mediasquence.entity.MediaItem;
import com.mediasquence.entity.PlaylistItem;
import com.mediasquence.exception.WindowNotEmptyException;
import com.mediasquence.repository.DisplayWindowRepository;
import com.mediasquence.repository.MediaItemRepository;
import com.mediasquence.repository.PlaylistItemRepository;
import com.mediasquence.service.SyncService;
import com.mediasquence.service.implementation.DisplayWindowServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DisplayWindowDeletionTest {

    @Mock
    private DisplayWindowRepository displayWindowRepository;

    @Mock
    private MediaItemRepository mediaItemRepository;

    @Mock
    private PlaylistItemRepository playlistItemRepository;

    @Mock
    private SyncService syncService;

    @InjectMocks
    private DisplayWindowServiceImpl displayWindowService;

    private DisplayWindow testWindow;

    @BeforeEach
    public void setUp() {
        testWindow = new DisplayWindow("Window Test", "Testing description");
        testWindow.setId(100L);
    }

    @Test
    @DisplayName("Should block deletion when window playlist contains items (Image, Video, or Blank)")
    public void testDeleteWindowWithPlaylistItemsBlocked() {
        when(displayWindowRepository.findByIdWithPlaylistItems(100L)).thenReturn(Optional.of(testWindow));

        MediaItem media = new MediaItem("Test Media", MediaType.IMAGE, "https://example.com/img.jpg", 30);
        PlaylistItem item = new PlaylistItem(testWindow, media, 1);
        when(playlistItemRepository.findByDisplayWindowIdOrderBySequenceOrderAsc(100L))
                .thenReturn(List.of(item));

        assertThrows(WindowNotEmptyException.class, () -> {
            displayWindowService.deleteWindow(100L);
        });

        verify(displayWindowRepository, never()).delete(any(DisplayWindow.class));
    }

    @Test
    @DisplayName("Should allow deletion when window playlist is completely empty")
    public void testDeleteEmptyWindowSuccess() {
        when(displayWindowRepository.findByIdWithPlaylistItems(100L)).thenReturn(Optional.of(testWindow));
        when(playlistItemRepository.findByDisplayWindowIdOrderBySequenceOrderAsc(100L))
                .thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            displayWindowService.deleteWindow(100L);
        });

        verify(displayWindowRepository, times(1)).delete(testWindow);
        verify(displayWindowRepository, times(1)).flush();
    }
}
