# Offline Sync

Mechanism:
- Zustand persist to IndexedDB
- Pending operations queued in IndexedDB
- `useRunBackgroundOps` polls connectivity and batches sync
- Exponential backoff on failures
- Conflict resolution: server timestamps win
