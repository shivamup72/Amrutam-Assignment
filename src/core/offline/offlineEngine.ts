import { logger } from '../logger/logger';
import { secureStorage } from '../storage/secureStorage';

const QUEUE_STORAGE_KEY = 'offline_queue_encrypted';

class OfflineEngine {
  constructor() {
    this.queue = [];
    this.listeners = [];
    this.loadQueue();
  }

  async loadQueue() {
    try {
      const saved = await secureStorage.getItem(QUEUE_STORAGE_KEY);
      if (Array.isArray(saved)) {
        this.queue = saved;
        this.notify();
      }
    } catch (err) {
      logger.log('warn', 'Failed to load secure offline queue from storage', { err });
    }
  }

  async saveQueue() {
    try {
      await secureStorage.setItem(QUEUE_STORAGE_KEY, this.queue);
    } catch (err) {
      logger.log('error', 'Failed to save secure offline queue', { err });
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener([...this.queue]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    const queueCopy = [...this.queue];
    this.listeners.forEach((listener) => listener(queueCopy));
  }

  enqueue(type, payload) {
    const item = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    this.queue.push(item);
    this.saveQueue();
    logger.log('info', `[Offline Engine] Enqueued secure action: ${type}`, { payload });
    return item;
  }

  getQueue() {
    return [...this.queue];
  }

  async processSync(executor) {
    if (this.queue.length === 0) return 0;
    logger.log('info', `[Offline Engine] Processing sync for ${this.queue.length} queued items...`);

    const remainingQueue = [];
    let syncedCount = 0;

    for (const item of this.queue) {
      try {
        const success = await executor(item);
        if (success) {
          syncedCount++;
          logger.log('info', `[Offline Engine] Action ${item.id} (${item.type}) synced successfully.`);
        } else {
          item.retryCount++;
          remainingQueue.push(item);
        }
      } catch (error) {
        item.retryCount++;
        remainingQueue.push(item);
      }
    }

    this.queue = remainingQueue;
    this.saveQueue();
    return syncedCount;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineEngine = new OfflineEngine();
