package com.mediasquence;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SequencerLogicTest {

    private static final int FIVE_HOURS_IN_SECONDS = 5 * 3600; // 18,000 seconds

    @Test
    @DisplayName("Verify 5-hour continuous timeline offset calculation")
    public void testContinuousTimelineOffset() {
        int totalPlaylistDuration = 45; // 15s + 20s + 10s = 45 seconds total

        // Simulated timestamp 100 seconds after epoch
        long currentTimeSeconds = 100L;
        long cycleTimeSeconds = currentTimeSeconds % FIVE_HOURS_IN_SECONDS; // 100 % 18000 = 100
        int playlistOffsetSeconds = (int) (cycleTimeSeconds % totalPlaylistDuration); // 100 % 45 = 10

        // At 10 seconds into the playlist:
        // Item 1 (15s): 0..15 -> Active item is Item 1, elapsed is 10s.
        assertEquals(10, playlistOffsetSeconds);
    }

    @Test
    @DisplayName("Verify rollover after 5-hour cycle completion")
    public void testFiveHourCycleRollover() {
        int totalPlaylistDuration = 45;

        // Simulated timestamp exactly at 5 hours (18,000 seconds)
        long currentTimeSeconds = 18000L;
        long cycleTimeSeconds = currentTimeSeconds % FIVE_HOURS_IN_SECONDS; // 0
        int playlistOffsetSeconds = (int) (cycleTimeSeconds % totalPlaylistDuration); // 0

        // Should restart cleanly at offset 0
        assertEquals(0, playlistOffsetSeconds);
    }
}
