import { Injectable } from "@nestjs/common";

@Injectable()
export class LocationSearchCache {
  private cache = new Map<string, any>();

  set(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000
    });
  }

  get(key: string): any | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    return item.value;
  }
}