import { Injectable } from '@nestjs/common';
import { LocationView2 } from '../repositories/location-view.repository';

interface CacheItem {
  value: LocationView2 | null;
  expiry: number;
}

@Injectable()
export class LocationResultCache2 {
  private cache = new Map<string, CacheItem>();

  constructor() {
    // 주기적으로 만료된 항목 정리 (예: 매 5분마다)
    setInterval(() => this.cleanExpiredItems(), 5 * 60 * 1000);
  }

  set(key: string, value: LocationView2 | null, ttlSeconds: number = 3600): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): LocationView2 | null | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  private cleanExpiredItems(): void {
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}