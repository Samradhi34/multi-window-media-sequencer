package com.mediasquence.config;

import com.mediasquence.constants.MediaType;
import com.mediasquence.entity.DisplayWindow;
import com.mediasquence.entity.MediaItem;
import com.mediasquence.entity.PlaylistItem;
import com.mediasquence.repository.DisplayWindowRepository;
import com.mediasquence.repository.MediaItemRepository;
import com.mediasquence.repository.PlaylistItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DisplayWindowRepository displayWindowRepository;
    private final MediaItemRepository mediaItemRepository;
    private final PlaylistItemRepository playlistItemRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        executeSchemaFixes();
        seedDataIfNecessary();
    }

    private void executeSchemaFixes() {
        try {
            jdbcTemplate.execute("ALTER TABLE media_items ALTER COLUMN url TYPE TEXT");
            log.info("Ensured PostgreSQL column 'url' in 'media_items' is TEXT type.");
        } catch (Exception e) {
            log.debug("Notice: Unable to alter column url to TEXT (table may not exist yet or already altered): {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE sync_state DROP CONSTRAINT IF EXISTS fk4dtgfp71g8t5n56kae9yklk58");
            log.info("Cleared restrictive legacy FK constraint fk4dtgfp71g8t5n56kae9yklk58 on sync_state.");
        } catch (Exception e) {
            log.debug("Notice: Could not drop constraint fk4dtgfp71g8t5n56kae9yklk58: {}", e.getMessage());
        }
    }

    @Transactional
    public void seedDataIfNecessary() {
        mediaItemRepository.findAll().forEach(item -> {
            if (item.getUrl() != null && item.getUrl().contains("commondatastorage.googleapis.com")) {
                if (item.getTitle().contains("Ocean")) {
                    item.setUrl("https://vjs.zencdn.net/v/oceans.mp4");
                } else if (item.getTitle().contains("Mountains")) {
                    item.setUrl("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4");
                } else {
                    item.setUrl("https://www.w3schools.com/html/mov_bbb.mp4");
                }
                mediaItemRepository.save(item);
                log.info("Updated legacy media item '{}' (ID {}) to active public MP4 URL.", item.getTitle(), item.getId());
            }
        });

        if (displayWindowRepository.count() > 0 && mediaItemRepository.count() > 0) {
            log.info("Database initialized with {} display windows and media lists.", displayWindowRepository.count());
            return;
        }

        log.info("Seeding initial display windows and media catalog matching design reference...");

        MediaItem m1 = mediaItemRepository.save(new MediaItem(
                "M1 - Travel.jpg",
                MediaType.IMAGE,
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
                30
        ));

        MediaItem m2 = mediaItemRepository.save(new MediaItem(
                "M2 - Ocean.mp4",
                MediaType.VIDEO,
                "https://vjs.zencdn.net/v/oceans.mp4",
                45
        ));

        MediaItem m3 = mediaItemRepository.save(new MediaItem(
                "M3 - Coffee.jpg",
                MediaType.IMAGE,
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
                30
        ));

        MediaItem m4 = mediaItemRepository.save(new MediaItem(
                "M4 - Logo.jpg",
                MediaType.IMAGE,
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
                20
        ));

        MediaItem m5 = mediaItemRepository.save(new MediaItem(
                "M5 - Mountains.mp4",
                MediaType.VIDEO,
                "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                45
        ));

        MediaItem m6 = mediaItemRepository.save(new MediaItem(
                "M6 - City.jpg",
                MediaType.IMAGE,
                "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80",
                30
        ));

        MediaItem m7 = mediaItemRepository.save(new MediaItem(
                "M7 - Nature.mp4",
                MediaType.VIDEO,
                "https://www.w3schools.com/html/mov_bbb.mp4",
                30
        ));

        MediaItem m8 = mediaItemRepository.save(new MediaItem(
                "Blank Screen",
                MediaType.BLANK,
                null,
                15
        ));

        /**
         * Display Window Creation (3 Display Windows)
         */
        DisplayWindow window1 = displayWindowRepository.findByName("Window 1").orElseGet(() ->
                displayWindowRepository.save(new DisplayWindow("Window 1", "Primary concourse display screen")));

        DisplayWindow window2 = displayWindowRepository.findByName("Window 2").orElseGet(() ->
                displayWindowRepository.save(new DisplayWindow("Window 2", "Secondary storefront gallery window")));

        DisplayWindow window3 = displayWindowRepository.findByName("Window 3").orElseGet(() ->
                displayWindowRepository.save(new DisplayWindow("Window 3", "Internal customer lobby feature screen")));

        addPlaylistItem(window1, m1, 1);
        addPlaylistItem(window1, m5, 2);
        addPlaylistItem(window1, m6, 3);
        addPlaylistItem(window1, m8, 4);

        addPlaylistItem(window2, m2, 1);
        addPlaylistItem(window2, m4, 2);
        addPlaylistItem(window2, m7, 3);
        addPlaylistItem(window2, m8, 4);

        addPlaylistItem(window3, m3, 1);
        addPlaylistItem(window3, m2, 2);
        addPlaylistItem(window3, m1, 3);
        addPlaylistItem(window3, m8, 4);

        log.info("Database seeding complete. Created 3 windows and 8 media catalog assets.");
    }

    private void addPlaylistItem(DisplayWindow window, MediaItem mediaItem, int order) {
        playlistItemRepository.save(new PlaylistItem(window, mediaItem, order));
    }
}
