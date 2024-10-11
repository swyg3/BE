import { Injectable } from '@nestjs/common';
import { LocationView2 } from '../repositories/location-view.repository';

@Injectable()
export class LocationResultCache {
  private cache = new Map<string, LocationView2 | null>();

  set(key: string, value: LocationView2 | null): void {
    this.cache.set(key, value);
  }

  get(key: string): LocationView2 | null | undefined {
    return this.cache.get(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}