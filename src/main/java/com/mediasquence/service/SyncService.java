package com.mediasquence.service;

import com.mediasquence.dto.request.SyncTriggerRequest;
import com.mediasquence.dto.response.SyncStatusResponse;
import com.mediasquence.entity.SyncState;

public interface SyncService {
    SyncStatusResponse getCurrentSyncStatus();
    SyncStatusResponse triggerSync(SyncTriggerRequest request);
    void cancelSync();
    SyncState getRawSyncState();
}
